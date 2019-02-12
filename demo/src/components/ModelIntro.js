import React from 'react';

/*******************************************************************************
  <ModelIntro /> Component
*******************************************************************************/

class ModelIntro extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      showFullDescription: false
    }
  }

  toggleShowMore() {
    this.setState({showFullDescription: !this.state.showFullDescription})
  }

  render() {

    const { title, description, descriptionEllipsed } = this.props;

    return (
      <div>
        <h2><span>{title}</span></h2>
        <p>
          {descriptionEllipsed
            ? (
              this.state.showFullDescription
                ? <span>{description} <span><a onClick={e => this.toggleShowMore()}>Show Less</a></span></span>
                : <span>{descriptionEllipsed} <span><a onClick={e => this.toggleShowMore()}>Show More</a></span></span>
            )
            : <span>{description}</span>
          }
        </p>
      </div>
    );
  }
}

export default ModelIntro;
