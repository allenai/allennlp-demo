import React from 'react';
import { Link } from 'react-router-dom';
import { models } from '../models'
import '../css/Menu.css';

/*******************************************************************************
  <Header /> Component
*******************************************************************************/

class Menu extends React.Component {
    render() {
      const { selectedModel, clearData } = this.props;

      const buildLink = (thisModel, label) => {
        return (
          <li>
            <span className={`nav__link ${selectedModel === thisModel ? "nav__link--selected" : ""}`}>
              <Link to={"/" + thisModel} onClick={clearData}>
                <span>{label}</span>
              </Link>
            </span>
          </li>
        )
      }

      const links = models.map(({model, name}) => buildLink(model, name))

      return (
        <div className="menu">
          <div className="menu__content">
            <h1 className="menu__content__logo">
              <a href="http://www.allennlp.org/" target="_blank" rel="noopener noreferrer">
                <svg>
                  <use xlinkHref="#icon__allennlp-logo"></use>
                </svg>
                <span className="u-hidden">AllenNLP</span>
              </a>
            </h1>
            <nav>
              <ul>
                  {links}
              </ul>
            </nav>
          </div>
        </div>
      );
    }
  }

export default Menu;
