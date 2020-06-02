import React from 'react'

import Accueil from './Accueil'
import Annonces from './Annonces'
import Blogs from './Blogs'
import Vitrine from './Vitrine'

const domainesConnus = {Annonces, Vitrine, Blogs}

export function SectionContenu(props) {

  const Page = domainesConnus[props.rootProps.page]

  let contenu
  if(Page) {
    contenu = <Page rootProps={props.rootProps} />
  } else {
    contenu = <Accueil {...props.rootProps} />
  }

  return contenu
}
