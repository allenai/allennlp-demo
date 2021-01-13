import React from 'react';
import { Collapse } from 'antd';

import {
    PrettyPrintedJSON,
    TextWithHighlight,
    Output,
    ArithmeticEquation,
    ModelSuccess,
} from '../../tugboat/components';
import { Model } from '../../tugboat/lib';
import { ModelId } from '../../lib';
import { UnexpectedModelError, InvalidModelResponseError } from '../../tugboat/error';
import {
    Input,
    Prediction,
    NAQANetAnswerType,
    BiDAFPrediction,
    NAQANetPrediction,
    TransformerQAPrediction,
    NMNPrediction,
    isBiDAFPrediction,
    isNAQANetPrediction,
    isTransformerQAPrediction,
    isNMNPrediction,
    isNAQANetPredictionSpan,
    isNAQANetPredictionCount,
    isNAQANetPredictionArithmetic,
    getBasicAnswer,
} from './types';
import { NMNOutput } from './nmn';

export const Predictions = ({ input, output, model }: ModelSuccess<Input, Prediction>) => (
    <Output.Section title="Model Output">
        <OutputByModel input={input} output={output} model={model} />

        <Output.SubSection title="Debug Output">
            <Collapse>
                <Collapse.Panel key="model-debug" header="Model">
                    <PrettyPrintedJSON json={model} />
                </Collapse.Panel>
                <Collapse.Panel key="input-debug" header="Input">
                    <PrettyPrintedJSON json={input} />
                </Collapse.Panel>
                <Collapse.Panel key="output-debug" header="Output">
                    <PrettyPrintedJSON json={output} />
                </Collapse.Panel>
            </Collapse>
        </Output.SubSection>
    </Output.Section>
);

// TODO: [jon 5] remove mock data
const mockData: NMNPrediction = {
    answer: '2',
    inputs: [
        {
            name: 'question',
            tokens: [
                'How',
                'many',
                'partially',
                'reusable',
                'launch',
                'systems',
                'were',
                'developed',
                '?',
            ],
        },
        {
            name: 'passage',
            tokens: [
                'A',
                'reusable',
                'launch',
                'system',
                '(',
                'RLS',
                ',',
                'or',
                'reusable',
                'launch',
                'vehicle',
                ',',
                'RLV',
                ')',
                'is',
                'a',
                'launch',
                'system',
                'which',
                'is',
                'capable',
                'of',
                'launching',
                'a',
                'payload',
                'into',
                'space',
                'more',
                'than',
                'once',
                '.',
                'This',
                'contrasts',
                'with',
                'expendable',
                'launch',
                'systems',
                ',',
                'where',
                'each',
                'launch',
                'vehicle',
                'is',
                'launched',
                'once',
                'and',
                'then',
                'discarded',
                '.',
                'No',
                'completely',
                'reusable',
                'orbital',
                'launch',
                'system',
                'has',
                'ever',
                'been',
                'created',
                '.',
                'Two',
                'partially',
                'reusable',
                'launch',
                'systems',
                'were',
                'developed',
                ',',
                'the',
                'Space',
                'Shuttle',
                'and',
                'Falcon',
                '9',
                '.',
                'The',
                'Space',
                'Shuttle',
                'was',
                'partially',
                'reusable',
                ':',
                'the',
                'orbiter',
                '(',
                'which',
                'included',
                'the',
                'Space',
                'Shuttle',
                'main',
                'engines',
                'and',
                'the',
                'Orbital',
                'Maneuvering',
                'System',
                'engines',
                ')',
                ',',
                'and',
                'the',
                'two',
                'solid',
                'rocket',
                'boosters',
                'were',
                'reused',
                'after',
                'several',
                'months',
                'of',
                'refitting',
                'work',
                'for',
                'each',
                'launch',
                '.',
                'The',
                'external',
                'tank',
                'was',
                'discarded',
                'after',
                'each',
                'flight',
                '.',
            ],
        },
        {
            name: 'numbers',
            tokens: ['2', '9', '0', '100.0'],
        },
        {
            name: 'dates',
            tokens: ['-1/-1/-1'],
        },
        {
            name: 'composed_numbers',
            tokens: [
                '0.0',
                '4.0',
                '7.0',
                '11.0',
                '18.0',
                '91.0',
                '98.0',
                '102.0',
                '109.0',
                '200.0',
            ],
        },
        {
            name: 'year_diffs',
            tokens: ['0'],
        },
        {
            name: 'count',
            tokens: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        },
    ],
    passage:
        'A reusable launch system (RLS, or reusable launch vehicle, RLV) is a launch system which is capable of launching a payload into space more than once. This contrasts with expendable launch systems, where each launch vehicle is launched once and then discarded. No completely reusable orbital launch system has ever been created. Two partially reusable launch systems were developed, the Space Shuttle and Falcon 9. The Space Shuttle was partially reusable: the orbiter (which included the Space Shuttle main engines and the Orbital Maneuvering System engines), and the two solid rocket boosters were reused after several months of refitting work for each launch. The external tank was discarded after each flight.',
    predicted_ans: '2',
    program_execution: [
        {
            find: [
                {
                    input_name: 'question',
                    label: 'question_attention',
                    values: [
                        8.952876555667899e-7,
                        2.3476296462376922e-7,
                        0.03939640149474144,
                        0.07580299582332373,
                        0.3972088396549225,
                        0.48622554540634155,
                        8.749145490583032e-5,
                        0.0012762193800881505,
                        1.4050748404770275e-6,
                    ],
                },
                {
                    input_name: 'passage',
                    label: 'module_output',
                    values: [
                        0.003315163776278496,
                        0.013376312330365181,
                        0.003738782601431012,
                        0.00481835613027215,
                        0.003092775586992502,
                        0.006655811564996839,
                        0.0022690691985189915,
                        0.002577460603788495,
                        0.009472654666751623,
                        0.0029571051709353924,
                        0.0036763313692063093,
                        0.002450949512422085,
                        0.007347400300204754,
                        0.0021957880817353725,
                        0.002295654732733965,
                        0.0022674985229969025,
                        0.002160310745239258,
                        0.002197385299950838,
                        0.001987581606954336,
                        0.0019603779073804617,
                        0.0019909394904971123,
                        0.002142433077096939,
                        0.002467663027346134,
                        0.0022613918408751488,
                        0.00240851822309196,
                        0.001969495788216591,
                        0.0026495589409023523,
                        0.002515786560252309,
                        0.002211294136941433,
                        0.003298082621768117,
                        0.002243499970063567,
                        0.0018968719523400068,
                        0.0016844322672113776,
                        0.0018685432150959969,
                        0.005273655755445361,
                        0.0018788770539686084,
                        0.002032476244494319,
                        0.0019942529033869505,
                        0.0019302988657727838,
                        0.0021193521097302437,
                        0.0020340769551694393,
                        0.002181155839934945,
                        0.002026481321081519,
                        0.002214922569692135,
                        0.0026187116745859385,
                        0.0016978136263787746,
                        0.0017229081131517887,
                        0.0023576472885906696,
                        0.002080374862998724,
                        0.0022331473883241415,
                        0.004641678184270859,
                        0.007950972532853484,
                        0.0019086981192231178,
                        0.0020534510258585215,
                        0.0028051540721207857,
                        0.001979048829525709,
                        0.0028514505829662085,
                        0.0028063522186130285,
                        0.0034393309615552425,
                        0.011213280260562897,
                        0.05179708078503609,
                        0.06489305198192596,
                        0.11056602746248245,
                        0.03167631849646568,
                        0.04439464211463928,
                        0.03385121002793312,
                        0.04704856500029564,
                        0.003931086976081133,
                        0.017412375658750534,
                        0.03156888112425804,
                        0.03236085921525955,
                        0.0007563261315226555,
                        0.016143053770065308,
                        0.034593693912029266,
                        0.0030438934918493032,
                        0.00549297733232379,
                        0.01028410717844963,
                        0.012520480901002884,
                        0.011781091801822186,
                        0.03638271614909172,
                        0.08874938264489174,
                        0.004015161655843258,
                        0.005404094699770212,
                        0.01731056859716773,
                        0.003793290350586176,
                        0.0032059939112514257,
                        0.0021984863560646772,
                        0.0023939188104122877,
                        0.002004376146942377,
                        0.0017368518747389317,
                        0.0014851285377517343,
                        0.001682927249930799,
                        0.0012465957552194595,
                        0.0012087938375771046,
                        0.0011129595804959536,
                        0.002303709276020527,
                        0.001171635463833809,
                        0.001360656344331801,
                        0.0016261492855846882,
                        0.0016793196555227041,
                        0.0019798376597464085,
                        0.002580485073849559,
                        0.0037830036599189043,
                        0.002282555680721998,
                        0.002281488850712776,
                        0.004939801758155227,
                        0.002031716052442789,
                        0.0020556531380861998,
                        0.00225460366345942,
                        0.003019897500053048,
                        0.002654477721080184,
                        0.001982075860723853,
                        0.003222472849301994,
                        0.0014078743988648057,
                        0.0014939855318516493,
                        0.0015115543501451612,
                        0.0017125830054283142,
                        0.0016754838870838284,
                        0.001565038925036788,
                        0.0013808486983180046,
                        0.0015532294055446982,
                        0.0016100252978503704,
                        0.001815066672861576,
                        0.0018060108413919806,
                        0.0017738965107128024,
                        0.0018866410246118903,
                        0.002183385659009218,
                    ],
                },
            ],
        },
        {
            filter: [
                {
                    input_name: 'question',
                    label: 'question_attention',
                    values: [
                        0.0002515787200536579,
                        0.0006316788494586945,
                        0.06732869893312454,
                        0.35592566058039665,
                        0.011104457080364227,
                        0.007748464588075876,
                        0.10770093649625778,
                        0.4491834044456482,
                        0.00012513565889094025,
                    ],
                },
                {
                    input_name: 'passage',
                    label: 'module_output',
                    values: [
                        0.0022983145900070667,
                        0.009273440344259143,
                        0.0025919980835169554,
                        0.003340437775477767,
                        0.0021441387943923473,
                        0.004614296602085233,
                        0.0015730850864201784,
                        0.001786884618923068,
                        0.00656713848002255,
                        0.00205008196644485,
                        0.0025487025268375874,
                        0.0016991777811199427,
                        0.005093756481073797,
                        0.0015222813235595822,
                        0.0015915161930024624,
                        0.001571996253915131,
                        0.0014976857928559184,
                        0.0015233886661008,
                        0.0013779372675344348,
                        0.0013590776361525059,
                        0.001380265224725008,
                        0.0014852916356176138,
                        0.001710764947347343,
                        0.001567762577906251,
                        0.0016697613755241036,
                        0.0013653988717123866,
                        0.0018368684686720371,
                        0.0017441277159377933,
                        0.0015330312307924032,
                        0.002286472823470831,
                        0.0015553586417809129,
                        0.0016050199046730995,
                        0.0014252659166231751,
                        0.00158104975707829,
                        0.004462252487428486,
                        0.0015897935954853892,
                        0.0017197600100189447,
                        0.0016874177381396294,
                        0.0016333037056028843,
                        0.0017932693008333445,
                        0.0017211145022884011,
                        0.0018455637618899345,
                        0.0017146874452009797,
                        0.0018741352250799537,
                        0.0022157973144203424,
                        0.0014365885872393847,
                        0.0014578219270333648,
                        0.0019949001725763083,
                        0.0017602889565750957,
                        0.002320223255082965,
                        0.00482266815379262,
                        0.008261000039055943,
                        0.001983122667297721,
                        0.0021335200872272253,
                        0.002914533717557788,
                        0.002056216588243842,
                        0.0029626355972141027,
                        0.002915778663009405,
                        0.0035734388511627913,
                        0.011650512926280499,
                        0.060843560844659805,
                        0.07622677087783813,
                        0.12987664341926575,
                        0.03720866143703461,
                        0.05214827135205269,
                        0.039763402193784714,
                        0.05526570975780487,
                        0.0046176603063941,
                        0.02045348845422268,
                        0.03708245977759361,
                        0.038012757897377014,
                        0.0008884202688932419,
                        0.018962476402521133,
                        0.04063556343317032,
                        0.0035755163989961147,
                        0.004525601398199797,
                        0.008472958579659462,
                        0.010315481573343277,
                        0.009706307202577591,
                        0.029975304380059242,
                        0.07311960682272911,
                        0.0033080459106713533,
                        0.004452371969819069,
                        0.014261979842558503,
                        0.003125248709693551,
                        0.0026413819286972284,
                        0.001811307854950428,
                        0.0019723225850611925,
                        0.0016513826558366418,
                        0.0014309724792838097,
                        0.0012235804460942745,
                        0.001386544550769031,
                        0.0010270560160279274,
                        0.0009959115413948894,
                        0.00091695471201092,
                        0.001897999842185527,
                        0.0009652971057221293,
                        0.001121029257774353,
                        0.0013397658476606011,
                        0.0013835723511874676,
                        0.0016311656218022108,
                        0.002126032253727317,
                        0.00311677367426455,
                        0.0018805715953931212,
                        0.0018796927761286497,
                        0.004069846356287599,
                        0.0016739076236262918,
                        0.0016936290776357055,
                        0.001857542316429317,
                        0.002488059224560857,
                        0.0021869938354939222,
                        0.0016330097569152713,
                        0.002654958632774651,
                        0.001159931649453938,
                        0.0012308777077123523,
                        0.0012453524395823479,
                        0.0014109776820987463,
                        0.0013804120244458318,
                        0.0012881287839263678,
                        0.0011365283280611038,
                        0.0012784088030457497,
                        0.0013251554919406772,
                        0.0014939178945496678,
                        0.0014864644035696983,
                        0.0014600320719182491,
                        0.0015528283547610044,
                        0.0017970683984458447,
                    ],
                },
                {
                    input_name: 'passage',
                    label: 'module_input',
                    values: [
                        0.003315163776278496,
                        0.013376312330365181,
                        0.003738782601431012,
                        0.00481835613027215,
                        0.003092775586992502,
                        0.006655811564996839,
                        0.0022690691985189915,
                        0.002577460603788495,
                        0.009472654666751623,
                        0.0029571051709353924,
                        0.0036763313692063093,
                        0.002450949512422085,
                        0.007347400300204754,
                        0.0021957880817353725,
                        0.002295654732733965,
                        0.0022674985229969025,
                        0.002160310745239258,
                        0.002197385299950838,
                        0.001987581606954336,
                        0.0019603779073804617,
                        0.0019909394904971123,
                        0.002142433077096939,
                        0.002467663027346134,
                        0.0022613918408751488,
                        0.00240851822309196,
                        0.001969495788216591,
                        0.0026495589409023523,
                        0.002515786560252309,
                        0.002211294136941433,
                        0.003298082621768117,
                        0.002243499970063567,
                        0.0018968719523400068,
                        0.0016844322672113776,
                        0.0018685432150959969,
                        0.005273655755445361,
                        0.0018788770539686084,
                        0.002032476244494319,
                        0.0019942529033869505,
                        0.0019302988657727838,
                        0.0021193521097302437,
                        0.0020340769551694393,
                        0.002181155839934945,
                        0.002026481321081519,
                        0.002214922569692135,
                        0.0026187116745859385,
                        0.0016978136263787746,
                        0.0017229081131517887,
                        0.0023576472885906696,
                        0.002080374862998724,
                        0.0022331473883241415,
                        0.004641678184270859,
                        0.007950972532853484,
                        0.0019086981192231178,
                        0.0020534510258585215,
                        0.0028051540721207857,
                        0.001979048829525709,
                        0.0028514505829662085,
                        0.0028063522186130285,
                        0.0034393309615552425,
                        0.011213280260562897,
                        0.05179708078503609,
                        0.06489305198192596,
                        0.11056602746248245,
                        0.03167631849646568,
                        0.04439464211463928,
                        0.03385121002793312,
                        0.04704856500029564,
                        0.003931086976081133,
                        0.017412375658750534,
                        0.03156888112425804,
                        0.03236085921525955,
                        0.0007563261315226555,
                        0.016143053770065308,
                        0.034593693912029266,
                        0.0030438934918493032,
                        0.00549297733232379,
                        0.01028410717844963,
                        0.012520480901002884,
                        0.011781091801822186,
                        0.03638271614909172,
                        0.08874938264489174,
                        0.004015161655843258,
                        0.005404094699770212,
                        0.01731056859716773,
                        0.003793290350586176,
                        0.0032059939112514257,
                        0.0021984863560646772,
                        0.0023939188104122877,
                        0.002004376146942377,
                        0.0017368518747389317,
                        0.0014851285377517343,
                        0.001682927249930799,
                        0.0012465957552194595,
                        0.0012087938375771046,
                        0.0011129595804959536,
                        0.002303709276020527,
                        0.001171635463833809,
                        0.001360656344331801,
                        0.0016261492855846882,
                        0.0016793196555227041,
                        0.0019798376597464085,
                        0.002580485073849559,
                        0.0037830036599189043,
                        0.002282555680721998,
                        0.002281488850712776,
                        0.004939801758155227,
                        0.002031716052442789,
                        0.0020556531380861998,
                        0.00225460366345942,
                        0.003019897500053048,
                        0.002654477721080184,
                        0.001982075860723853,
                        0.003222472849301994,
                        0.0014078743988648057,
                        0.0014939855318516493,
                        0.0015115543501451612,
                        0.0017125830054283142,
                        0.0016754838870838284,
                        0.001565038925036788,
                        0.0013808486983180046,
                        0.0015532294055446982,
                        0.0016100252978503704,
                        0.001815066672861576,
                        0.0018060108413919806,
                        0.0017738965107128024,
                        0.0018866410246118903,
                        0.002183385659009218,
                    ],
                },
            ],
        },
        {
            count: [
                {
                    input_name: 'passage',
                    label: 'module_input',
                    values: [
                        0.0022983145900070667,
                        0.009273440344259143,
                        0.0025919980835169554,
                        0.003340437775477767,
                        0.0021441387943923473,
                        0.004614296602085233,
                        0.0015730850864201784,
                        0.001786884618923068,
                        0.00656713848002255,
                        0.00205008196644485,
                        0.0025487025268375874,
                        0.0016991777811199427,
                        0.005093756481073797,
                        0.0015222813235595822,
                        0.0015915161930024624,
                        0.001571996253915131,
                        0.0014976857928559184,
                        0.0015233886661008,
                        0.0013779372675344348,
                        0.0013590776361525059,
                        0.001380265224725008,
                        0.0014852916356176138,
                        0.001710764947347343,
                        0.001567762577906251,
                        0.0016697613755241036,
                        0.0013653988717123866,
                        0.0018368684686720371,
                        0.0017441277159377933,
                        0.0015330312307924032,
                        0.002286472823470831,
                        0.0015553586417809129,
                        0.0016050199046730995,
                        0.0014252659166231751,
                        0.00158104975707829,
                        0.004462252487428486,
                        0.0015897935954853892,
                        0.0017197600100189447,
                        0.0016874177381396294,
                        0.0016333037056028843,
                        0.0017932693008333445,
                        0.0017211145022884011,
                        0.0018455637618899345,
                        0.0017146874452009797,
                        0.0018741352250799537,
                        0.0022157973144203424,
                        0.0014365885872393847,
                        0.0014578219270333648,
                        0.0019949001725763083,
                        0.0017602889565750957,
                        0.002320223255082965,
                        0.00482266815379262,
                        0.008261000039055943,
                        0.001983122667297721,
                        0.0021335200872272253,
                        0.002914533717557788,
                        0.002056216588243842,
                        0.0029626355972141027,
                        0.002915778663009405,
                        0.0035734388511627913,
                        0.011650512926280499,
                        0.060843560844659805,
                        0.07622677087783813,
                        0.12987664341926575,
                        0.03720866143703461,
                        0.05214827135205269,
                        0.039763402193784714,
                        0.05526570975780487,
                        0.0046176603063941,
                        0.02045348845422268,
                        0.03708245977759361,
                        0.038012757897377014,
                        0.0008884202688932419,
                        0.018962476402521133,
                        0.04063556343317032,
                        0.0035755163989961147,
                        0.004525601398199797,
                        0.008472958579659462,
                        0.010315481573343277,
                        0.009706307202577591,
                        0.029975304380059242,
                        0.07311960682272911,
                        0.0033080459106713533,
                        0.004452371969819069,
                        0.014261979842558503,
                        0.003125248709693551,
                        0.0026413819286972284,
                        0.001811307854950428,
                        0.0019723225850611925,
                        0.0016513826558366418,
                        0.0014309724792838097,
                        0.0012235804460942745,
                        0.001386544550769031,
                        0.0010270560160279274,
                        0.0009959115413948894,
                        0.00091695471201092,
                        0.001897999842185527,
                        0.0009652971057221293,
                        0.001121029257774353,
                        0.0013397658476606011,
                        0.0013835723511874676,
                        0.0016311656218022108,
                        0.002126032253727317,
                        0.00311677367426455,
                        0.0018805715953931212,
                        0.0018796927761286497,
                        0.004069846356287599,
                        0.0016739076236262918,
                        0.0016936290776357055,
                        0.001857542316429317,
                        0.002488059224560857,
                        0.0021869938354939222,
                        0.0016330097569152713,
                        0.002654958632774651,
                        0.001159931649453938,
                        0.0012308777077123523,
                        0.0012453524395823479,
                        0.0014109776820987463,
                        0.0013804120244458318,
                        0.0012881287839263678,
                        0.0011365283280611038,
                        0.0012784088030457497,
                        0.0013251554919406772,
                        0.0014939178945496678,
                        0.0014864644035696983,
                        0.0014600320719182491,
                        0.0015528283547610044,
                        0.0017970683984458447,
                    ],
                },
                {
                    input_name: 'count',
                    label: 'module_output',
                    values: [
                        4.235788765072357e-6,
                        0.011012149043381214,
                        0.5243629813194275,
                        0.4573134779930115,
                        0.00730496272444725,
                        2.1371947696025018e-6,
                        1.1452300045788899e-11,
                        1.123994626430557e-18,
                        9.999999682655225e-21,
                        9.999999682655225e-21,
                    ],
                },
            ],
        },
    ],
    program_lisp: '(count (filter find))',
    program_nested_expression: [
        {
            identifier: 3,
            name: 'count',
        },
        [
            {
                identifier: 2,
                name: 'filter',
            },
            {
                identifier: 1,
                name: 'find',
            },
        ],
    ],
    question: 'How many partially reusable launch systems were developed?',
};
const useMock = true;

const OutputByModel = ({
    input,
    output,
    model,
}: {
    input: Input;
    output: Prediction;
    model: Model;
}) => {
    if (useMock) {
        return <NMNOutput {...mockData} />;
    }

    switch (model.id) {
        case ModelId.Bidaf:
        case ModelId.BidafElmo:
        case ModelId.TransformerQa: {
            if (isBiDAFPrediction(output) || isTransformerQAPrediction(output)) {
                return <BasicPrediction input={input} output={output} />;
            }
            break;
        }
        case ModelId.Naqanet: {
            if (isNAQANetPrediction(output)) {
                return <NaqanetPrediction input={input} output={output} model={model} />;
            }
            break;
        }
        case ModelId.Nmn: {
            if (isNMNPrediction(output)) {
                return <NMNOutput {...output} />;
            }
            break;
        }
    }
    // If we dont have an output throw.
    throw new UnexpectedModelError(model.id);
};

const BasicAnswer = ({ output }: { output: Prediction }) => {
    return (
        <Output.SubSection title="Answer">
            <div>{getBasicAnswer(output)}</div>
        </Output.SubSection>
    );
};

const BasicPrediction = ({
    input,
    output,
}: {
    input: Input;
    output: TransformerQAPrediction | BiDAFPrediction;
}) => {
    // Best_span is a span of tokens, we dont render the tokens here,
    // so we just find the highlightSpan locally.
    const start = input.passage.indexOf(output.best_span_str);
    const highlightSpan = [start, start + output.best_span_str.length];

    if (highlightSpan[0] < 0 || highlightSpan[1] <= highlightSpan[0]) {
        throw new InvalidModelResponseError(
            `"${output.best_span_str}" does not exist in the passage.`
        );
    }

    return (
        <>
            <BasicAnswer output={output} />

            <Output.SubSection title="Passage Context">
                <TextWithHighlight
                    text={input.passage}
                    highlights={[
                        {
                            start: highlightSpan[0],
                            end: highlightSpan[1],
                        },
                    ]}
                />
            </Output.SubSection>

            <Output.SubSection title="Question">
                <div>{input.question}</div>
            </Output.SubSection>
        </>
    );
};

const NaqanetPrediction = ({
    input,
    output,
    model,
}: {
    input: Input;
    output: NAQANetPrediction;
    model: Model;
}) => {
    // NAQANetAnswerType.PassageSpan
    if (
        isNAQANetPredictionSpan(output) &&
        output.answer.answer_type === NAQANetAnswerType.PassageSpan
    ) {
        return (
            <>
                <BasicAnswer output={output} />

                <Output.SubSection title="Explanation">
                    The model decided the answer was in the passage.
                </Output.SubSection>

                <Output.SubSection title="Passage Context">
                    <TextWithHighlight
                        text={input.passage}
                        highlights={output.answer.spans.map((s) => {
                            return {
                                start: s[0],
                                end: s[1],
                            };
                        })}
                    />
                </Output.SubSection>

                <Output.SubSection title="Question">
                    <div>{input.question}</div>
                </Output.SubSection>
            </>
        );
    }

    // NAQANetAnswerType.QuestionSpan
    if (
        isNAQANetPredictionSpan(output) &&
        output.answer.answer_type === NAQANetAnswerType.QuestionSpan
    ) {
        return (
            <>
                <BasicAnswer output={output} />

                <Output.SubSection title="Explanation">
                    The model decided the answer was in the question.
                </Output.SubSection>

                <Output.SubSection title="Passage Context">
                    <div>{input.passage}</div>
                </Output.SubSection>

                <Output.SubSection title="Question">
                    <TextWithHighlight
                        text={input.question}
                        highlights={output.answer.spans.map((s) => {
                            return {
                                start: s[0],
                                end: s[1],
                            };
                        })}
                    />
                </Output.SubSection>
            </>
        );
    }

    // NAQANetAnswerType.Count
    if (isNAQANetPredictionCount(output)) {
        return (
            <>
                <BasicAnswer output={output} />

                <Output.SubSection title="Explanation">
                    The model decided this was a counting problem.
                </Output.SubSection>

                <Output.SubSection title="Passage Context">
                    <div>{input.passage}</div>
                </Output.SubSection>

                <Output.SubSection title="Question">
                    <div>{input.question}</div>
                </Output.SubSection>
            </>
        );
    }

    // NAQANetAnswerType.Arithmetic
    if (isNAQANetPredictionArithmetic(output)) {
        // numbers include all numbers in the context, but we only care about ones that are positive or negative
        const releventNumbers = (output.answer.numbers || []).filter((n) => n.sign !== 0);

        return (
            <>
                <BasicAnswer output={output} />

                <Output.SubSection title="Explanation">
                    {releventNumbers.length ? (
                        <div>
                            The model used the arithmetic expression{' '}
                            <ArithmeticEquation
                                numbersWithSign={releventNumbers}
                                answer={output.answer.value}
                                answerAtEnd={true}
                            />
                        </div>
                    ) : (
                        <div>The model decided this was an arithmetic problem.</div>
                    )}
                </Output.SubSection>

                <Output.SubSection title="Passage Context">
                    {releventNumbers.length ? (
                        <TextWithHighlight
                            text={input.passage}
                            highlights={releventNumbers.map((n) => {
                                return {
                                    start: n.span[0],
                                    end: n.span[1],
                                    color: n.sign > 0 ? 'G6' : 'R6',
                                };
                            })}
                        />
                    ) : (
                        <div>{input.passage}</div>
                    )}
                </Output.SubSection>

                <Output.SubSection title="Question">
                    <div>{input.question}</div>
                </Output.SubSection>
            </>
        );
    }

    // payload matched no known viz
    throw new InvalidModelResponseError(model.id);
};
