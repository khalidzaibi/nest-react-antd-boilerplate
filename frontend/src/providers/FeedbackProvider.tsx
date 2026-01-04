import { useEffect } from 'react';
import { App } from 'antd';
import { registerFeedbackApis } from '@/lib/feedback';

const FeedbackProvider = () => {
  const { notification, message } = App.useApp();

  useEffect(() => {
    registerFeedbackApis({ notification, message });
  }, [notification, message]);

  return null;
};

export default FeedbackProvider;
