import type { CustomMessageTriggerEvent } from 'aws-lambda';
import {
  cognitoVerificationSubject,
  cognitoVerificationTemplate,
} from '../../src/modules/email/infrastructure/templates/cognito-verification.template';
import {
  cognitoPasswordResetSubject,
  cognitoPasswordResetTemplate,
} from '../../src/modules/email/infrastructure/templates/cognito-password-reset.template';
import {
  cognitoAdminInviteSubject,
  cognitoAdminInviteTemplate,
} from '../../src/modules/email/infrastructure/templates/cognito-admin-invite.template';

export const handler = (
  event: CustomMessageTriggerEvent,
): Promise<CustomMessageTriggerEvent> => {
  switch (event.triggerSource) {
    case 'CustomMessage_SignUp':
    case 'CustomMessage_ResendCode':
      event.response.emailSubject = cognitoVerificationSubject();
      event.response.emailMessage = cognitoVerificationTemplate();
      break;
    case 'CustomMessage_ForgotPassword':
      event.response.emailSubject = cognitoPasswordResetSubject();
      event.response.emailMessage = cognitoPasswordResetTemplate();
      break;
    case 'CustomMessage_AdminCreateUser':
      event.response.emailSubject = cognitoAdminInviteSubject();
      event.response.emailMessage = cognitoAdminInviteTemplate();
      break;
    default:
      break;
  }
  return Promise.resolve(event);
};
