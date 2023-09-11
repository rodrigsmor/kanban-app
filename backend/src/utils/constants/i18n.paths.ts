import { I18nTranslations } from '../@types/i18n.translations';

export const i18nPaths: I18nTranslations = {
  dto: {
    auth: {
      firstName: {
        IS_NOT_EMPTY: 'dto.auth.firstName.IS_NOT_EMPTY',
        IS_STRING: 'dto.auth.firstName.IS_STRING',
      },
      lastName: {
        IS_STRING: 'dto.auth.lastName.IS_STRING',
        IS_NOT_EMPTY: 'dto.auth.lastName.IS_NOT_EMPTY',
      },
      email: {
        IS_EMAIL: 'dto.auth.email.IS_EMAIL',
        IS_NOT_EMPTY: 'dto.auth.email.IS_NOT_EMPTY',
        IS_STRING: 'dto.auth.email.IS_STRING',
      },
      password: {
        IS_NOT_EMPTY: 'dto.auth.password.IS_NOT_EMPTY',
        IS_STRING: 'dto.auth.password.IS_STRING',
        MIN: 'dto.auth.password.MIN',
      },
    },
  },
};
