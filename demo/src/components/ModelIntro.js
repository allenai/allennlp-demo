import React from 'react';
import { Button } from '@allenai/varnish/components';

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
                ? <span>{description} <span><Button onClick={e => this.toggleShowMore()} ghost variant="link">Show Less</Button></span></span>
                : <span>{descriptionEllipsed} <span><Button onClick={e => this.toggleShowMore()} ghost variant="link">Show More</Button></span></span>
            )
            : <span>{description}</span>
          }
        </p>
      </div>
    );
  }
}

export default ModelIntro;
