'use strict';

var FacebookAuth = React.createClass({
  displayName: 'FacebookAuth',

  propTypes: {
    onUserAuthenticated: React.PropTypes.func.isRequired
  },

  getInitialState: function getInitialState() {
    return {
      loggedIn: false,
      fbName: '',
      fbId: 0
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
      this.setState({
        loggedIn: true,
        fbName: response.name,
        fbId: response.id
      }, function () {
        this.props.onUserAuthenticated(this.state.fbId);
      });
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
    FB.login(this.checkLoginState());
  },

  render: function render() {
    return React.createElement(
      'div',
      { className: 'facebook-auth' },
      this.state.loggedIn ? React.createElement(
        'span',
        null,
        'Welcome ',
        this.state.fbName
      ) : React.createElement(
        'a',
        { href: '#', onClick: this.handleClick },
        'Please login first'
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
      url: '/templates',
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
    this.setState({
      templateId: e.currentTarget.value
    }, function () {
      this.props.onTemplateSelected(this.state.templateId);
    });
  },

  render: function render() {
    return React.createElement(
      'div',
      { className: 'template-select' },
      this.state.templates.map(function (template, idx) {
        return React.createElement(
          'span',
          { key: idx },
          React.createElement('input', { type: 'radio', name: 'template',
            value: template.id, onChange: this.onSelectionChanged }),
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
      fbId: 0,
      templateId: 0
    };
  },

  onUserAuthenticated: function onUserAuthenticated(fbId) {
    this.setState({ fbId: fbId });
    console.log(fbId);
  },

  onTemplateSelected: function onTemplateSelected(templateId) {
    this.setState({ templateId: templateId });
    console.log(templateId);
  },

  render: function render() {
    return React.createElement(
      'div',
      { className: 'causes-view' },
      React.createElement(FacebookAuth, { onUserAuthenticated: this.onUserAuthenticated }),
      React.createElement('hr', null),
      React.createElement(TemplateSelect, { onTemplateSelected: this.onTemplateSelected }),
      React.createElement('hr', null),
      React.createElement(Result, null)
    );
  }
});