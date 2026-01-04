import type { NotificationInstance, ArgsProps } from 'antd/es/notification/interface';
import type { MessageInstance } from 'antd/es/message/interface';

let notificationApi: NotificationInstance | null = null;
let messageApi: MessageInstance | null = null;

export const registerFeedbackApis = (apis: { notification: NotificationInstance; message: MessageInstance }) => {
  notificationApi = apis.notification;
  messageApi = apis.message;
};

const toNotificationArgs = (input: string | ArgsProps): ArgsProps =>
  typeof input === 'string'
    ? { message: input || 'Notification' }
    : { ...input, message: input.message || 'Notification' };

export const feedback = {
  success: (args: string | Parameters<NotificationInstance['success']>[0]) => {
    notificationApi?.success(toNotificationArgs(args));
  },
  info: (args: string | Parameters<NotificationInstance['info']>[0]) => {
    notificationApi?.info(toNotificationArgs(args));
  },
  warning: (args: string | Parameters<NotificationInstance['warning']>[0]) => {
    notificationApi?.warning(toNotificationArgs(args));
  },
  error: (args: string | Parameters<MessageInstance['error']>[0]) => {
    if (messageApi) {
      messageApi.error(args);
      return;
    }
    notificationApi?.error(toNotificationArgs(args as string));
  },
};
