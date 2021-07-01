// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';

import './NavBar.css';

interface INavBarDataProps extends RouteComponentProps {
  links: Array<{label:string, to: string}>
}

const NavBar: React.FC<INavBarDataProps> = (props) => {

  const navBarLinks = props.links.map(o => ({
    ...o,
    selected: props.location.pathname === o.to
  }));

  return (
    <div id="Nav">
      <ul>
        {navBarLinks.map(o => (
          <li key={o.to} className={o.selected ? 'selected' : ''}><Link to={o.to}>{o.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export default withRouter(NavBar);
