import React from 'react';

// class FramePortal extends React.PureComponent {
//   constructor(props) {
//     super(props)
//     this.containerEl = document.createElement('div')
//   }

//   render() {
//     return (
//       <iframe style={{width: "100%"}} src={this.props.src} ref={el => (this.iframe = el)}/>
//     )
//   }
// }

export const FramePortal = (props) => <iframe style={{width: "100%"}} src={props.src}/>
