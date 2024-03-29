import { defineMessages, injectIntl } from 'react-intl';

import { connect }   from 'react-redux';

import { openModal } from 'flavours/glitch/actions/modal';
import { me } from 'flavours/glitch/initial_state';
import { logOut } from 'flavours/glitch/utils/log_out';

import NavigationPanel from '../components/navigation_panel';

const messages = defineMessages({
  logoutMessage: { id: 'confirmations.logout.message', defaultMessage: 'Are you sure you want to log out?' },
  logoutConfirm: { id: 'confirmations.logout.confirm', defaultMessage: 'Log out' },
});

const mapStateToProps = state => {
  return {
    account: state.getIn(['accounts', me]),
  };
};

const mapDispatchToProps = (dispatch, { intl }) => ({
  onLogout () {
    dispatch(openModal({
      modalType: 'CONFIRM',
      modalProps: {
        message: intl.formatMessage(messages.logoutMessage),
        confirm: intl.formatMessage(messages.logoutConfirm),
        closeWhenConfirm: false,
        onConfirm: () => logOut(),
      },
    }));
  },
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(NavigationPanel));
