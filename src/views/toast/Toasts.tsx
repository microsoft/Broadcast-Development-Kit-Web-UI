// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React from 'react';
import { useSelector } from 'react-redux';
import IAppState from '../../services/store/IAppState';
import { ToastCard } from './toast-card/ToastCard';
import './Toasts.css';

export const Toasts: React.FC = () => {
    const items = useSelector((state:IAppState) => state.toast.items);
    return (
      <div className="toastContainer">
        {items.map((item) => (
          <ToastCard item={item}/>
        ))}
      </div>
    );
}

