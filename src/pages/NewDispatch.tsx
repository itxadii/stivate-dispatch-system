import React from 'react';
import { NewDispatchPage, type NewDispatchProps } from '../components/new-dispatch/NewDispatchPage';

export const NewDispatch: React.FC<NewDispatchProps> = (props) => {
  return <NewDispatchPage {...props} />;
};

export default NewDispatch;
