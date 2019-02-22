import React from 'react';
import HeatMap from '../HeatMap'
import { withRouter } from 'react-router-dom';
import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody,
} from 'react-accessible-accordion';
import Model from '../Model'
import OutputField from '../OutputField'
import { API_ROOT } from '../../api-config';
import { truncate } from '../DemoInput'

const title = "Reading Comprehension"

const description = (
  <span>
    Reading comprehension is the task of answering questions about a passage of text to show that
    the system understands the passage.
  </span>
  )

const descriptionEllipsed = (
  <span>
    Reading comprehension is the task of answering questions about a passage of text to show that
    the system…
  </span>
)

const taskModels = [
  {
    value: "BiDAF",
    desc: "Reimplementation of BiDAF (Seo et al, 2017), or Bi-Directional Attention Flow,<br/>\
    a widely used MC baseline that achieved state-of-the-art accuracies on<br/>\
    the SQuAD dataset (Wikipedia sentences) in early 2017."
  },
  {
    value: "Augmented QANet",
    desc: "Combining Local Convolution with Global Self-Attention for Reading Comprehension"
  }
]

const taskEndpoints = {
  "BiDAF": "machine-comprehension", // TODO: we should rename tha back-end model to reading-comprehension
  "Augmented QANet": "augmented-qanet-reading-comprehension"
};

const fields = [
  {name: "passage", label: "Passage", type: "TEXT_AREA",
   placeholder: `E.g. "Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius about nine times that of Earth. Although it has only one-eighth the average density of Earth, with its larger volume Saturn is just over 95 times more massive. Saturn is named after the Roman god of agriculture; its astronomical symbol represents the god's sickle"`},
  {name: "question", label: "Question", type: "TEXT_INPUT",
   placeholder: `E.g. "What does Saturn’s astronomical symbol represent"`}
  // {name: "model", label: "Model", type: "RADIO", options: taskModels, optional: true} // TODO: add when matts model is ready
]

// TODO: delete mock data
const mockResponses = {
  arithmetic: {
    passage: "In 2018, Bert came out. In 2016, Elmo came out.",
    question: "How many years after Elmo came out did Bert come out?",
    "answer": {
      "answer_type": "arithmetic",
      "numbers": [
        {
          "span": [3, 7],
          "sign": 1,
          "value": 2018
        },
        {
          "span": [27, 31],
          "sign": -1,
          "value": 2016
        },
      ],
      "value": 2
    },
    "passage_question_attention": [
      [
        5.382280992421995e-13,
        1.510175441358079e-26,
        1,
        1.559410656160054e-10,
        3.3915381614235685e-10,
        4.5621749433788494e-11,
        2.1028146238166734e-11,
        9.68686148479568e-16,
        1.2083028154419306e-11,
        1.2086104415453408e-13,
        3.917993707247547e-11,
        1.2777879584883806e-34
      ],
      [
        7.70592411495491e-13,
        1.5828266532692266e-32,
        1,
        1.0096729875785915e-11,
        2.400985833761471e-11,
        5.1515910271362e-14,
        9.914282123133639e-14,
        8.604214888317807e-15,
        8.329893442767314e-14,
        1.3808049891201116e-14,
        1.9607321950949885e-13,
        1.581940409880315e-38
      ],
      [
        5.044168021776452e-15,
        1.1959174084813835e-29,
        1,
        1.1353297588081318e-14,
        7.631902380032807e-15,
        3.397050516556197e-16,
        6.8373475575489936e-18,
        2.1156813139339336e-25,
        1.2320907336355938e-17,
        6.023746872509826e-19,
        1.4838074354072577e-15,
        0
      ],
      [
        6.337176877008188e-12,
        8.201217372616903e-26,
        7.720748346207174e-11,
        1.3301122356312867e-11,
        0.4674889147281647,
        1.211955119595487e-10,
        2.7318966533407263e-10,
        1.5698624041340925e-13,
        0.5325110554695129,
        1.1752659392558207e-13,
        1.6453706452868033e-10,
        6.873841803041932e-26
      ],
      [
        2.2593818482796735e-10,
        2.569999737315769e-29,
        0.002158930990844965,
        0.00007713833474554121,
        3.572412765606714e-8,
        0.9840913414955139,
        0.0012485546758398414,
        8.92474005809163e-9,
        1.8848780314328906e-9,
        2.0067876249640904e-8,
        0.012424037791788578,
        1.213116910803406e-28
      ],
      [
        3.87506804422344e-10,
        2.7429966719870193e-32,
        0.06231643632054329,
        0.000010343236681364942,
        1.5966033117820189e-7,
        0.07062219083309174,
        0.09468498080968857,
        1.3391718312050216e-7,
        7.586164585404731e-9,
        6.227929105762087e-8,
        0.7723656892776489,
        1.9491886299536227e-27
      ],
      [
        4.344025239406933e-44,
        0,
        1,
        7.794114145183475e-35,
        3.1509984184667517e-32,
        4.786207772421558e-38,
        2.3850099862808387e-42,
        0,
        2.941031203940283e-40,
        1.2471556332490872e-43,
        7.787152332983127e-37,
        0
      ],
      [
        1.1618555510045647e-12,
        6.215718183938177e-27,
        1,
        3.744545562511803e-9,
        8.903104919966154e-10,
        1.6490344645347932e-9,
        1.0777032599662562e-9,
        3.110707153561147e-14,
        8.923910221891873e-11,
        1.4862626103798182e-12,
        1.6127530422238578e-9,
        1.1926490745678064e-32
      ],
      [
        2.5691214021635045e-14,
        6.907257610842052e-35,
        1,
        1.7810403759449533e-12,
        2.938824314110966e-13,
        6.7820534717453595e-15,
        3.4042338853445056e-14,
        1.911157050758089e-15,
        1.8344815107902614e-15,
        2.591597040254071e-15,
        4.644293847069769e-14,
        3.9459163456922524e-41
      ],
      [
        1.8687386571991302e-14,
        2.960656683788949e-30,
        1,
        9.94625388994752e-14,
        2.0778212863389184e-14,
        3.6043267844084945e-15,
        7.87034361052277e-17,
        1.2463482640370672e-24,
        4.234296527500566e-17,
        1.2078958661545403e-17,
        3.2107986652459355e-14,
        0
      ],
      [
        1.7536043797616863e-11,
        1.0500529820512821e-26,
        1.2052800424378063e-10,
        6.436818959787427e-12,
        0.829809844493866,
        6.652190603917418e-11,
        1.0732544714064929e-10,
        1.9305198173565075e-13,
        0.17019018530845642,
        9.858443271795747e-13,
        4.798511032966246e-10,
        3.933116506316762e-25
      ],
      [
        2.7771294153211556e-9,
        2.8747206740432713e-29,
        0.011041221208870411,
        0.0001544465631013736,
        1.002793723614559e-7,
        0.9075256586074829,
        0.0011098847026005387,
        8.436011000867438e-9,
        5.6334812370550935e-9,
        2.1149968176814582e-7,
        0.08016844093799591,
        3.639913465065844e-28
      ],
      [
        5.330715313611734e-10,
        1.8555059308926788e-32,
        0.0414835661649704,
        0.0000061874497987446375,
        2.9477579488457195e-8,
        0.003406123723834753,
        0.00569542171433568,
        9.605611417384807e-9,
        2.968599144281825e-9,
        1.1170522640213676e-7,
        0.9494085311889648,
        5.16851274708757e-28
      ],
      [
        4.0637655465419695e-44,
        0,
        1,
        4.7805403743649076e-35,
        4.950580499492648e-33,
        2.6346274856264113e-39,
        4.203895392974451e-44,
        0,
        1.1803136965007934e-41,
        3.545285114741787e-43,
        1.7043834034077203e-37,
        0
      ]
    ],
    "passage_tokens": [
      "In",
      "2018",
      ",",
      "Bert",
      "came",
      "out",
      ".",
      "In",
      "2016",
      ",",
      "Elmo",
      "came",
      "out",
      "."
    ],
    "question_id": "None",
    "question_tokens": [
      "How",
      "many",
      "years",
      "after",
      "Elmo",
      "came",
      "out",
      "did",
      "Bert",
      "come",
      "out",
      "?"
    ]
  },

  question_span: {
    passage: "In 2018, Bert came out. In 2016, Elmo came out.",
    question: "Which came out first, Elmo or Bert?",
    "answer": {
      "answer_type": "question_span",
      "spans": [
        [
          22,
          26
        ]
      ],
      "value": "Elmo"
    },
    "passage_question_attention": [
      [
        3.9994077494220903e-10,
        0.000684793631080538,
        2.89507759987373e-8,
        0.00015700446965638548,
        3.498150429401934e-19,
        0.997052788734436,
        1.5381765449820108e-35,
        0.0021052854135632515,
        5.550474804469751e-30
      ],
      [
        8.764223125012904e-9,
        0.00008207653445424512,
        8.53462935879179e-8,
        0.000002436109070913517,
        2.377042588862932e-16,
        0.9999136924743652,
        1.5716007428555743e-26,
        0.000001722787601465825,
        4.666663202001747e-31
      ],
      [
        7.202556731541771e-17,
        1.3498242801279758e-10,
        2.419155319994962e-15,
        2.416458977361202e-10,
        1.9948922578072435e-21,
        0.9819977879524231,
        1.391867725659911e-40,
        0.018002253025770187,
        0
      ],
      [
        1.958450328992667e-12,
        1.285460210498357e-10,
        4.1787146659588714e-13,
        2.30125272136783e-13,
        6.981366888326047e-20,
        0.9972975850105286,
        1.0716654212198057e-27,
        0.002702403115108609,
        1.5094813939840201e-27
      ],
      [
        5.517566137314134e-8,
        0.9998377561569214,
        0.000034667536965571344,
        0.000004031297976325732,
        2.6026826968614154e-19,
        0.00011623278260231018,
        3.522014649439816e-26,
        0.000007288572760444367,
        3.013696862165848e-28
      ],
      [
        0.000008151207111950498,
        0.988745391368866,
        0.006187427788972855,
        0.00005767256152466871,
        1.2528352653455662e-17,
        0.004148123785853386,
        1.7646757360405534e-21,
        0.0008532426436431706,
        3.443849195680586e-25
      ],
      [
        8.42578585777263e-25,
        1.3390572762487889e-14,
        3.14289079469252e-27,
        3.3385813778165983e-25,
        0,
        0.9999731779098511,
        0,
        0.000026804840672411956,
        0
      ],
      [
        1.53076148978748e-10,
        0.001490758964791894,
        9.117972155081588e-8,
        0.0004740231961477548,
        1.1489493471921805e-19,
        0.9714529514312744,
        2.8738924833876328e-36,
        0.026582205668091774,
        3.9525720618738273e-28
      ],
      [
        1.6026119098455638e-8,
        0.007570197340101004,
        6.782011610084737e-7,
        0.00004648530011763796,
        7.360892501110344e-18,
        0.9923818707466125,
        1.3131212227961767e-26,
        6.899332447574125e-7,
        2.1726513973960136e-31
      ],
      [
        2.3188597302799115e-17,
        1.2677202343436278e-10,
        9.320569498293845e-16,
        2.5392297639537098e-11,
        2.315177004981979e-22,
        0.9031703472137451,
        4.0232259819690525e-40,
        0.09682965278625488,
        0
      ],
      [
        1.4819338789960612e-13,
        8.528823480791203e-12,
        5.412150050766295e-15,
        1.7620415590751792e-15,
        1.910426131273069e-21,
        0.9985306262969971,
        1.3733602284851274e-27,
        0.0014693939592689276,
        7.781413235952983e-28
      ],
      [
        6.154121479085006e-8,
        0.9996079802513123,
        0.000017347352695651352,
        9.075391744772787e-7,
        3.626679303944072e-19,
        0.0002683245111256838,
        1.178156982674177e-25,
        0.00010516941983951256,
        4.903496601537622e-28
      ],
      [
        0.000036075038224225864,
        0.8732996582984924,
        0.007618703879415989,
        0.000044960597733734176,
        9.29281765491714e-17,
        0.028279423713684082,
        5.167826386561526e-20,
        0.09072115272283554,
        1.6422586197057677e-24
      ],
      [
        1.4041734959771457e-24,
        1.4885175950445258e-14,
        2.6825891083450986e-27,
        8.781894803462179e-26,
        0,
        0.999922513961792,
        0,
        0.00007747919880785048,
        0
      ]
    ],
    "passage_tokens": [
      "In",
      "2018",
      ",",
      "Bert",
      "came",
      "out",
      ".",
      "In",
      "2016",
      ",",
      "Elmo",
      "came",
      "out",
      "."
    ],
    "question_id": "None",
    "question_tokens": [
      "Which",
      "came",
      "out",
      "first",
      ",",
      "Elmo",
      "or",
      "Bert",
      "?"
    ]
  },

  count: {
    passage: "In 2018, Bert came out. In 2016, Elmo came out.",
    question: "How many things came out?",
    "answer": {
      "answer_type": "count",
      "count": 2
    },
    "passage_question_attention": [
      [
        3.482627519701964e-8,
        1.3056934493637303e-20,
        0.9952409267425537,
        0.004733698442578316,
        0.000025389350412297063,
        4.464129195906707e-27
      ],
      [
        0.00013890671834815294,
        2.259118908226291e-21,
        0.9988164901733398,
        0.0009641375509090722,
        0.00008045040885917842,
        1.0635115153177563e-28
      ],
      [
        5.054516094560313e-8,
        3.602467985908586e-19,
        0.9999210834503174,
        0.00007810255192453042,
        8.185037927432859e-7,
        3.2347293490781212e-40
      ],
      [
        0.003823857521638274,
        1.8771646392029285e-16,
        0.541944146156311,
        0.4280051589012146,
        0.026226846501231194,
        6.34428537761308e-17
      ],
      [
        4.486144528775826e-12,
        2.5988991436793225e-30,
        0.0002387901331530884,
        0.999651312828064,
        0.00010993007163051516,
        6.604476002490485e-29
      ],
      [
        2.380136088220297e-10,
        1.3176852037830635e-31,
        0.12017253041267395,
        0.618334174156189,
        0.2614932656288147,
        4.2059361001486385e-26
      ],
      [
        4.74504934788191e-15,
        6.858539306124971e-38,
        0.9973024129867554,
        0.0026973593048751354,
        1.999981407152518e-7,
        0
      ],
      [
        1.3705320434098667e-8,
        8.138344996754303e-22,
        0.9960960745811462,
        0.0038612799253314734,
        0.00004267803160473704,
        3.431869726537223e-26
      ],
      [
        0.00006655041943304241,
        7.253791224762148e-23,
        0.9996329545974731,
        0.00025296633248217404,
        0.0000476028180855792,
        2.1847154959185028e-30
      ],
      [
        4.983233381494756e-8,
        3.269117947211867e-20,
        0.9999371767044067,
        0.0000617363111814484,
        0.0000010348583145969315,
        5.830760871101634e-40
      ],
      [
        0.004445930011570454,
        9.089746799768842e-17,
        0.7200824022293091,
        0.2583983540534973,
        0.0170732494443655,
        7.642489100733403e-17
      ],
      [
        2.0459656538407422e-11,
        2.157827520256438e-30,
        0.00027126172790303826,
        0.9995478987693787,
        0.00018073615501634777,
        2.815702958309955e-29
      ],
      [
        1.3535615961401959e-9,
        1.2014635600997496e-30,
        0.12014651298522949,
        0.3321745693683624,
        0.5476789474487305,
        1.4976231544269362e-26
      ],
      [
        5.982241764267539e-15,
        1.491948278131631e-35,
        0.9986618757247925,
        0.0013379874872043729,
        9.23956804399495e-8,
        0
      ]
    ],
    "passage_tokens": [
      "In",
      "2018",
      ",",
      "Bert",
      "came",
      "out",
      ".",
      "In",
      "2016",
      ",",
      "Elmo",
      "came",
      "out",
      "."
    ],
    "question_id": "None",
    "question_tokens": [
      "How",
      "many",
      "things",
      "came",
      "out",
      "?"
    ]
  },

  passage_span: {
    passage: "In 2018, Bert came out. In 2016, Elmo came out.",
    question: "What came out first?",
    "answer": {
      "answer_type": "passage_span",
      "spans": [
        [
          9,
          13
        ]
      ],
      "value": "Bert"
    },
    "passage_question_attention": [
      [
        8.153855191039838e-8,
        0.9982709884643555,
        5.11932228164369e-7,
        0.0017284578643739223,
        3.516852199038711e-29
      ],
      [
        0.0000032008074413170107,
        0.9999349117279053,
        0.000019136541595798917,
        0.000042627969378372654,
        3.065214103916059e-29
      ],
      [
        8.068155921137077e-7,
        0.8111987709999084,
        1.3797354370126413e-7,
        0.1888003796339035,
        1.327436022270256e-40
      ],
      [
        0.00007359552546404302,
        0.9997373223304749,
        0.00017920805839821696,
        0.00000982431993179489,
        2.0499469113745868e-19
      ],
      [
        5.384493406701552e-10,
        0.9999994039535522,
        4.876503680861788e-7,
        7.719561523344964e-8,
        2.8131702757974925e-31
      ],
      [
        0.000006067840786272427,
        0.9996888637542725,
        0.0002982988371513784,
        0.00000684634596836986,
        3.3989910040467347e-29
      ],
      [
        3.684915193076163e-15,
        0.9999986886978149,
        9.555400090968669e-13,
        0.0000012522198176156962,
        0
      ],
      [
        7.808336022208096e-8,
        0.9954167604446411,
        0.0000016353883438569028,
        0.004581425804644823,
        6.076078344430889e-28
      ],
      [
        7.24768369764206e-7,
        0.9999649524688721,
        0.000006037424554961035,
        0.000028252739866729826,
        1.6776624812082566e-31
      ],
      [
        0.0000010638043477229076,
        0.9244036078453064,
        1.7665462337390636e-7,
        0.07559508830308914,
        1.9049951973263726e-40
      ],
      [
        0.0001265837490791455,
        0.9997398257255554,
        0.0001293700042879209,
        0.000004217575224174652,
        2.902597965951771e-19
      ],
      [
        1.1861267523727292e-9,
        0.9999996423721313,
        3.797836427565926e-7,
        4.337953996014221e-8,
        5.456744105789703e-32
      ],
      [
        0.0000306183283100836,
        0.9994903802871704,
        0.00045016605872660875,
        0.00002882449007302057,
        9.570556022248026e-30
      ],
      [
        1.1983417256005054e-14,
        0.9999995231628418,
        1.029299258673011e-12,
        5.292779405863257e-7,
        0
      ]
    ],
    "passage_tokens": [
      "In",
      "2018",
      ",",
      "Bert",
      "came",
      "out",
      ".",
      "In",
      "2016",
      ",",
      "Elmo",
      "came",
      "out",
      "."
    ],
    "question_id": "None",
    "question_tokens": [
      "What",
      "came",
      "out",
      "first",
      "?"
    ]
  },
}
const getMockRequest = (type) => {
  return {
    passage: mockResponses[type].passage,
    question: mockResponses[type].question
  }
}
const getMockResponse = (type) => {
  return {
    answer: mockResponses[type].answer,
    passage_question_attention: mockResponses[type].passage_question_attention,
    question_tokens: mockResponses[type].question_tokens,
    passage_tokens: mockResponses[type].passage_tokens,
    best_span_str: mockResponses[type].best_span_str
  }
}

const Attention = ({passage_question_attention, question_tokens, passage_tokens}) => {
  if(passage_question_attention && question_tokens && passage_tokens) {
    return (
        <OutputField label="Model internals">
          <Accordion accordion={false}>
            <AccordionItem expanded={true}>
              <AccordionItemTitle>
                Passage to Question attention
                <div className="accordion__arrow" role="presentation"/>
              </AccordionItemTitle>
              <AccordionItemBody>
                <p>
                  For every passage word, the model computes an attention over the question words.
                  This heatmap shows that attention, which is normalized for every row in the matrix.
                </p>
                <HeatMap
                  colLabels={question_tokens} rowLabels={passage_tokens}
                  data={passage_question_attention} />
              </AccordionItemBody>
            </AccordionItem>
          </Accordion>
        </OutputField>
    )
  }
  return null;
}

const NoAnswer = () => {
  return (
    <OutputField label="Answer">
      No answer returned.
    </OutputField>
  )
}

const MultiSpanHighlight = ({original, highlightSpans, highlightStyles}) => {
  if(original && highlightSpans && highlightStyles) {
    // assumes spans are not overlapping and in order
    let curIndex = 0;
    let spanList = [];
    highlightSpans.forEach((s, sIndex) => {
      if(s[0] > curIndex){
        // add preceding non-highlighted span
        spanList.push(<span key={`${curIndex}_${s[0]}`}>{original.slice(curIndex, s[0])}</span>);
        curIndex = s[0];
      }
      // add highlighted span
      if(s[1] > curIndex) {
        spanList.push(<span key={`${curIndex}_${s[1]}`} className={highlightStyles[sIndex]}>{original.slice(curIndex, s[1])}</span>);
        curIndex = s[1];
      }
    });
    // add last non-highlighted span
    if(curIndex < original.length) {
      spanList.push(<span key={`${curIndex}_${original.length}`}>{original.slice(curIndex)}</span>);
    }
    return (
      <span>
        {spanList.map(s=> s)}
      </span>
    )
  }
  return null;
}

const ArithmeticEquation = ({numbers}) => {
  if(numbers) {
    let ret = numbers
      .filter(n => n.sign !== 0)
      .map(n => `${n.sign > 0 ? "+" : "-"} ${n.value}`)
      .join(" ");
    while(ret.charAt(0) === "+" || ret.charAt(0) === " ") {
      ret = ret.substr(1);
    }
    return <span>{ret}</span>;
  }
  return null;
}

const AnswerByType = ({requestData, responseData, mockOption}) => { // TODO: remove mockOption here
  // mocking TODO: remove
  if(mockOption) {
    const mockOptions = ["passage_span", "question_span", "count", "arithmetic"];
    requestData = getMockRequest(mockOptions[mockOption]);
    responseData = getMockResponse(mockOptions[mockOption]);
  }

  if(requestData && responseData) {
    const { passage, question } = requestData;
    const { answer } = responseData;
    const { answer_type } = answer || {};

    switch(answer_type) {
      case "passage_span": {
        const { spans, value } = answer || {};
        if(question && passage && spans && value) {
          return (
            <section>
              <OutputField label="Answer">
                {value}
              </OutputField>

              <OutputField label="Explanation">
                The model decided the answer was in the passage.
              </OutputField>

              <OutputField label="Passage">
                <MultiSpanHighlight
                  original={passage}
                  highlightSpans={spans}
                  highlightStyles={spans.map(s => "highlight__answer")}/>
              </OutputField>

              <OutputField label="Question">
                {question}
              </OutputField>

              <Attention {...responseData}/>
            </section>
          )
        }
        return NoAnswer();
      }

      case "question_span": {
        const { spans, value } = answer || {};
        if(question && passage && spans && value) {
          return (
            <section>
              <OutputField label="Answer">
                {value}
              </OutputField>

              <OutputField label="Explanation">
                The model decided the answer was in the question.
              </OutputField>

              <OutputField label="Passage">
                {passage}
              </OutputField>

              <OutputField label="Question">
                <MultiSpanHighlight
                  original={question}
                  highlightSpans={spans}
                  highlightStyles={spans.map(s => "highlight__answer")}/>
              </OutputField>

              <Attention {...responseData}/>
            </section>
          )
        }
        return NoAnswer();
      }

      case "count": {
        const { count } = answer || {};
        if(question && passage && count) {
          return (
            <section>
              <OutputField label="Answer">
                {count}
              </OutputField>

              <OutputField label="Explanation">
                The model decided this was a counting problem.
              </OutputField>

              <OutputField label="Passage">
                {passage}
              </OutputField>

              <OutputField label="Question">
                {question}
              </OutputField>

              <Attention {...responseData}/>
            </section>
          )
        }
        return NoAnswer();
      }

      case "arithmetic": {
        const { numbers, value } = answer || {};
        if(question && passage && numbers && value) {
          return (
            <section>
              <OutputField label="Answer">
                {value}
              </OutputField>

              <OutputField label="Explanation">
                The model used the arithmetic expression <ArithmeticEquation numbers={numbers} /> = {value}.
              </OutputField>

              <OutputField label="Passage">
                <MultiSpanHighlight
                  original={passage}
                  highlightSpans={numbers.map(n => n.span)}
                  highlightStyles={numbers.map(n => `highlight__num_${n.sign}`)}/>
              </OutputField>

              <OutputField label="Question">
                {question}
              </OutputField>

              <Attention {...responseData}/>
            </section>
          )
        }
        return NoAnswer();
      }

      default: { // old best_span_str path (TODO: delete after api update)
        const { best_span_str } = responseData;
        if(question && passage && best_span_str) {
          const start = passage.indexOf(best_span_str);
          const head = passage.slice(0, start);
          const tail = passage.slice(start + best_span_str.length);
          return (
            <section>
              <OutputField label="Answer">
                {best_span_str}
              </OutputField>

              <OutputField label="Passage Context">
                <span>{head}</span>
                <span className="highlight__answer">{best_span_str}</span>
                <span>{tail}</span>
              </OutputField>

              <OutputField label="Question">
                {question}
              </OutputField>

              <Attention {...responseData}/>
            </section>
          )
        }
        return NoAnswer();
      }
    }
  }
  return NoAnswer();
}

const Output = (props) => { // TODO: remove mockOption here
  return (
    <div className="model__content answer">
      <AnswerByType {...props}/>
      <AnswerByType {...props} mockOption={0}/>
      <AnswerByType {...props} mockOption={1}/>
      <AnswerByType {...props} mockOption={2}/>
      <AnswerByType {...props} mockOption={3}/>
    </div>
  )
}

const examples = [
  {
    passage: "A reusable launch system (RLS, or reusable launch vehicle, RLV) is a launch system which is capable of launching a payload into space more than once. This contrasts with expendable launch systems, where each launch vehicle is launched once and then discarded. No completely reusable orbital launch system has ever been created. Two partially reusable launch systems were developed, the Space Shuttle and Falcon 9. The Space Shuttle was partially reusable: the orbiter (which included the Space Shuttle main engines and the Orbital Maneuvering System engines), and the two solid rocket boosters were reused after several months of refitting work for each launch. The external tank was discarded after each flight.",
    question: "How many partially reusable launch systems were developed?",
  },
  {
    passage: "Robotics is an interdisciplinary branch of engineering and science that includes mechanical engineering, electrical engineering, computer science, and others. Robotics deals with the design, construction, operation, and use of robots, as well as computer systems for their control, sensory feedback, and information processing. These technologies are used to develop machines that can substitute for humans. Robots can be used in any situation and for any purpose, but today many are used in dangerous environments (including bomb detection and de-activation), manufacturing processes, or where humans cannot survive. Robots can take on any form but some are made to resemble humans in appearance. This is said to help in the acceptance of a robot in certain replicative behaviors usually performed by people. Such robots attempt to replicate walking, lifting, speech, cognition, and basically anything a human can do.",
    question: "What do robots that resemble humans attempt to do?",
  },
  {
    passage: "The Matrix is a 1999 science fiction action film written and directed by The Wachowskis, starring Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss, Hugo Weaving, and Joe Pantoliano. It depicts a dystopian future in which reality as perceived by most humans is actually a simulated reality called \"the Matrix\", created by sentient machines to subdue the human population, while their bodies' heat and electrical activity are used as an energy source. Computer programmer \"Neo\" learns this truth and is drawn into a rebellion against the machines, which involves other people who have been freed from the \"dream world.\"",
    question: "Who stars in The Matrix?",
  },
  {
    passage: "Kerbal Space Program (KSP) is a space flight simulation video game developed and published by Squad for Microsoft Windows, OS X, Linux, PlayStation 4, Xbox One, with a Wii U version that was supposed to be released at a later date. The developers have stated that the gaming landscape has changed since that announcement and more details will be released soon. In the game, players direct a nascent space program, staffed and crewed by humanoid aliens known as \"Kerbals\". The game features a realistic orbital physics engine, allowing for various real-life orbital maneuvers such as Hohmann transfer orbits and bi-elliptic transfer orbits.",
    question: "What does the physics engine allow for?",
  }
].map(ex => ({...ex, snippet: truncate(ex.passage)}));

const apiUrl = ({model}) => {
  const selectedModel = model || taskModels[0]
  const endpoint = taskEndpoints[selectedModel.value]
  return `${API_ROOT}/predict/${endpoint}`
}

const modelProps = {apiUrl, title, description, descriptionEllipsed, fields, examples, Output}

export default withRouter(props => <Model {...props} {...modelProps}/>)
