export type I18nTranslations = {
  dto: {
    auth: {
      firstName: {
        IS_STRING: string;
        IS_NOT_EMPTY: string;
      };
      lastName: {
        IS_STRING: string;
        IS_NOT_EMPTY: string;
      };
      email: {
        IS_STRING: string;
        IS_NOT_EMPTY: string;
        IS_EMAIL: string;
      };
      password: {
        IS_STRING: string;
        IS_NOT_EMPTY: string;
        MIN: string;
      };
    };
  };
};
