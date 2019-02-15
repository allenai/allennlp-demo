import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody,
  } from 'react-accessible-accordion';
import { modelGroups } from '../models'
import '../css/Menu.css';

/*******************************************************************************
  <Header /> Component
*******************************************************************************/

class Menu extends React.Component {
    render() {
      const { selectedModel, expandedModelGroupIndexes, clearData, onExpandModelGroup, className } = this.props;

      const ModelGroup = ({modelGroup, expanded, uuid}) => (
        <MenuAccordionItem className={`accordion__item ${expanded?'expanded':''}`} expanded={expanded} uuid={uuid}>
          <MenuAccordionItemTitle className="accordion__title">
            {modelGroup.label}
            <div className="accordion__arrow" role="presentation"/>
          </MenuAccordionItemTitle>
          <MenuAccordionItemBody className="accordion__body">
            <ul>
                {modelGroup.models.map(m => <ModelLink key={m.name} model={m.model} name={m.name} />)}
            </ul>
          </MenuAccordionItemBody>
        </MenuAccordionItem>
      );

      const ModelLink = ({model, name}) => (
        <li key={model}>
          <span className={`nav__link ${selectedModel === model ? "nav__link--selected" : ""}`}>
            <Link to={"/" + model} onClick={clearData}>
              <span>{name}</span>
            </Link>
          </span>
        </li>
      );

      return (
        <div className={`menu ${className}`}>
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
              <MenuAccordion className="accordion" accordion={false} onChange={e => onExpandModelGroup(e)}>
                  {modelGroups.map((mg, index)=> <ModelGroup key={mg.label} modelGroup={mg} uuid={index} expanded={expandedModelGroupIndexes.includes(index)}/>)}
              </MenuAccordion>
            </nav>
          </div>
        </div>
      );
    }
  }

const MenuAccordion = styled(Accordion)`
  && {
    background: transparent;
  }
`;

const MenuAccordionItem = styled(AccordionItem)`
  &&& {
    border: none;
  }
`;

const MenuAccordionItemTitle = styled(AccordionItemTitle)`
  && {
    background-color: transparent;
    border: none;
    color: #6f7376;
    font-weight: normal;
    padding: 0 7px;
    font-size: 14px;
    margin-left: 20px;

    .accordion__arrow {
      top: 3px;
      left: 3px;
      color: #63a7d4;
      width: 22px;
      height: 10px;
    }

    .accordion__arrow::after,
    .accordion__arrow::before {
        width: 8px;
        height: 1px;
    }

    :hover{
      background: transparent;
      color: #1c2f3a;

      .accordion__arrow {
        top: 2px;
        width: 23px;
        height: 11px;
      }

      .accordion__arrow::after,
      .accordion__arrow::before {
          width: 9px;
          height: 2px;
      }
    }
  }
`;

const MenuAccordionItemBody = styled(AccordionItemBody)`
  && {
    animation: none;
    padding-left: 10px;
  }
`;

export default styled(Menu)`
`;
