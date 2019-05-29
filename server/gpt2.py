from allennlp.predictors import Predictor
from pytorch_pretrained_bert.tokenization_gpt2 import GPT2Tokenizer
from pytorch_pretrained_bert.modeling_gpt2 import GPT2LMHeadModel
import torch

from server.demo_model import DemoModel
from server.lru_cache import LRUCache

SMALL_MODEL = 'gpt2'
MEDIUM_MODEL = 'https://storage.googleapis.com/allennlp/models/gpt2-345M-dump'

class Gpt2Predictor(Predictor):
    """
    The HuggingFace implementation of GPT-2 is not an AllenNLP model;
    however, our demo only expects an AllenNLP ``Predictor``. Accordingly,
    we implement a ``Predictor`` that wraps the HuggingFace GPT-2 implementation.
    """
    def __init__(self,
                 model_name: str = MEDIUM_MODEL,
                 cache_size: int = 0) -> None:
        """
        Each cache element is about 8MB, so size accordingly.
        """
        # Cache stores tuples, so default value is a tuple
        self._cache = LRUCache(cache_size, default_value=(None, None))
        self.tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
        self.model = GPT2LMHeadModel.from_pretrained(model_name)

        # The end of text marker.
        self.END_OF_TEXT = self.tokenizer.encoder["<|endoftext|>"]


    def predict_json(self, inputs: dict) -> dict:
        previous_str = inputs["previous"]
        next_str = inputs.get("next")
        topk = inputs.get("topk", 10)

        logits = self._predict(previous_str, next_str)
        probabilities = torch.nn.functional.softmax(logits)

        best_logits, best_indices = logits.topk(topk)
        best_words = [self.tokenizer.decode([idx.item()])
                      for idx in best_indices]
        best_probabilities = probabilities[best_indices].tolist()

        return {
            "logits": best_logits.tolist(),
            "probabilities": best_probabilities,
            "words": best_words,
            "output": previous_str + (next_str or "")
        }

    def _predict(self, previous: str, next: str = None) -> torch.Tensor:

        past_logits, past = self._cache[previous]

        # CASE 1: Previously seen input, no next
        if next is None and past is not None:
            return past_logits

        # CASE 2: Previously seen input, yes next
        elif past is not None:
            token_ids = self.tokenizer.encode(next)
        # CASE 3: Brand new input, no next
        elif next is None:
            token_ids = self.tokenizer.encode(previous)
        # CASE 4: Brand new input, yes next
        else:
            token_ids = self.tokenizer.encode(previous) + self.tokenizer.encode(next)

        inputs = torch.LongTensor([token_ids])

        logits, present = self.model(inputs, past=past)
        logits = logits[0, -1]

        key = previous if next is None else previous + next
        self._cache[key] = logits, present

        return logits

    def __getitem__(self, index: int) -> str:
        return self.tokenizer.decode([index])


class Gpt2DemoModel(DemoModel):
    def predictor(self) -> Predictor:
        return Gpt2Predictor(self.archive_file)
