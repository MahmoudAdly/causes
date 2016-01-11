'use strict';

var FacebookAuth = React.createClass({
  displayName: 'FacebookAuth',

  propTypes: {
    onUserAuthenticated: React.PropTypes.func.isRequired
  },

  getInitialState: function getInitialState() {
    return {
      loggedIn: false,
      fbName: ''
    };
  },

  componentDidMount: function componentDidMount() {
    window.fbAsyncInit = function () {
      FB.init({
        appId: '1157541270945658',
        cookie: true, // enable cookies to allow the server to access
        // the session
        xfbml: true, // parse social plugins on this page
        version: 'v2.2' // use version 2.2
      });

      this.checkLoginState();
    }.bind(this);

    // Load the SDK asynchronously
    (function (d, s, id) {
      var js,
          fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  },

  getUserData: function getUserData() {
    FB.api('/me', function (response) {
      this.setState({ loggedIn: true, fbName: response.name });
      this.props.onUserAuthenticated(response.id);
    }.bind(this));
  },

  statusChangeCallback: function statusChangeCallback(response) {
    if (response.status === 'connected') {
      this.getUserData();
    } else if (response.status === 'not_authorized') {
      this.setState({ loggedIn: false });
    } else {
      this.setState({ loggedIn: false });
    }
  },

  checkLoginState: function checkLoginState() {
    FB.getLoginStatus(function (response) {
      this.statusChangeCallback(response);
    }.bind(this));
  },

  handleClick: function handleClick() {
    FB.login(function () {
      this.checkLoginState();
    }.bind(this));
  },

  render: function render() {
    return React.createElement(
      'div',
      { className: 'facebook-auth mdl-cell mdl-cell--12-col' },
      React.createElement(
        'div',
        { className: 'fb-card-wide mdl-card mdl-shadow--2dp' },
        React.createElement(
          'div',
          { className: 'mdl-card__title' },
          React.createElement(
            'h2',
            { className: 'mdl-card__title-text' },
            'Welcome',
            this.state.loggedIn ? React.createElement(
              'span',
              null,
              ', ',
              this.state.fbName,
              '!'
            ) : false
          )
        ),
        React.createElement(
          'div',
          { className: 'mdl-card__supporting-text' },
          'Please login with your Facebook account to load your profile picture. Be sure we store no data about you.'
        ),
        React.createElement(
          'div',
          { className: 'mdl-card__actions mdl-card--border' },
          this.state.loggedIn ? React.createElement(
            'i',
            { className: 'material-icons md-36 green' },
            'check_circle'
          ) : React.createElement(
            'a',
            {
              className: 'mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect',
              href: 'javascript:;', onClick: this.handleClick },
            'Login'
          )
        )
      )
    );
  }
});

var TemplateSelect = React.createClass({
  displayName: 'TemplateSelect',

  propTypes: {
    onTemplateSelected: React.PropTypes.func.isRequired
  },

  getInitialState: function getInitialState() {
    return {
      templates: []
    };
  },

  componentDidMount: function componentDidMount() {
    $.ajax({
      url: '/causes/templates/all',
      dataType: 'json',
      cache: false,
      success: function (response) {
        this.setState({ templates: response.data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err);
      }.bind(this)
    });
  },

  onSelectionChanged: function onSelectionChanged(e) {
    this.props.onTemplateSelected(e.currentTarget.value);
  },

  render: function render() {
    return React.createElement(
      'div',
      { className: 'template-select mdl-cell mdl-cell--12-col' },
      this.state.templates.map(function (template, idx) {
        return React.createElement(
          'span',
          { key: idx },
          React.createElement('input', { type: 'radio', name: 'template',
            value: template.id, onChange: this.onSelectionChanged }),
          React.createElement('img', { src: template.photo, style: { maxWidth: '48px' } }),
          template.title
        );
      }.bind(this))
    );
  }
});

var Result = React.createClass({
  displayName: 'Result',

  getInitialState: function getInitialState() {
    return {};
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'result' },
      'result'
    );
  }
});

var CausesView = React.createClass({
  displayName: 'CausesView',

  getInitialState: function getInitialState() {
    return {
      fbId: null,
      templateId: null
    };
  },

  onUserAuthenticated: function onUserAuthenticated(fbId) {
    this.setState({ fbId: fbId });
  },

  onTemplateSelected: function onTemplateSelected(templateId) {
    this.setState({ templateId: templateId });
  },

  onSubmit: function onSubmit(e) {
    var requestUrl = '/causes/templates/' + this.state.templateId + '/fbId/' + this.state.fbId;
    $.ajax({
      url: requestUrl,
      method: 'post',
      dataType: 'json',
      cache: false,
      success: function (response) {
        this.setState({ photoUrl: response.data.photoUrl });
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err);
      }.bind(this)
    });
  },

  render: function render() {
    return React.createElement(
      'div',
      { className: 'causes-view mdl-grid' },
      React.createElement(FacebookAuth, { onUserAuthenticated: this.onUserAuthenticated }),
      React.createElement('hr', null),
      React.createElement(TemplateSelect, { onTemplateSelected: this.onTemplateSelected }),
      React.createElement(
        'button',
        { type: 'submit', onClick: this.onSubmit,
          className: 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent',
          disabled: !this.state.fbId || !this.state.templateId },
        'Create'
      ),
      React.createElement('hr', null),
      React.createElement(Result, null)
    );
  }

});