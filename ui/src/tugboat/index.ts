import { Form as FormImpl, Field, Label, TextArea, Input, Select, OptDesc } from './form';

// Adding statics so that we can export a module that is useable as:
// <Form>
//   <Form.Field ...>
// </Form>
const Form = FormImpl as any; // any is so we can add the random statics below
Form.Field = Field;
Form.Label = Label;
Form.TextArea = TextArea;
Form.Input = Input;
Form.Select = Select;
Form.OptDesc = OptDesc;

export { Form };

export * from './shared';
export * from './Markdown';
export * from './ModelUsageModal';
export * from './ModelCardModal';
export * from './ModelCard';
export * from './DemoConfig';
export * from './Demos';
export * from './Demo';
export * from './DemoGroup';
