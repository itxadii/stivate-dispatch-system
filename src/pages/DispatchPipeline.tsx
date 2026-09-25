import React from 'react';
import { DispatchPipelinePage, type DispatchPipelineProps } from '../components/dispatch-pipeline/DispatchPipelinePage';

export const DispatchPipeline: React.FC<DispatchPipelineProps> = (props) => {
  return <DispatchPipelinePage {...props} />;
};

export default DispatchPipeline;
