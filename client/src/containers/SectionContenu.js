import React from 'react'

const domainesConnus = {
};

export function SectionContenu(props) {

  const Page = domainesConnus[props.rootProps.page]

  let contenu
  if(Page) {
    contenu = <Page rootProps={props.rootProps} />
  } else {
    contenu = <p>Section non definie : "{contenu}"</p>
  }

  return contenu
}
