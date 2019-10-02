from allennlp.predictors import Predictor
from allennlp.models.archival import load_archive


class DemoModel:
    """
    A demo model is determined by an archive file (representing the trained model), a
    choice of predictor, and a limit on the maximum request length it can handle.

    The initial max_request_length values were selected by querying the DB for:

        with queries_with_len as (select *, char_length(request_data) as request_len from queries)
            select model_name, max(request_len)/2 as max_lim from queries_with_len
            where response_data is not null
            group by model_name;

    These limits affect less than 1% of queries for each model.
    """
    def __init__(self, archive_file: str, predictor_name: str, max_request_length: int) -> None:
        self.archive_file = archive_file
        self.predictor_name = predictor_name
        self.max_request_length = max_request_length

    def predictor(self) -> Predictor:
        archive = load_archive(self.archive_file)
        return Predictor.from_archive(archive, self.predictor_name)
