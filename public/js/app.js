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
    var welcomeMsg;
    if (this.state.fbName) {
      welcomeMsg = React.createElement(
        'p',
        null,
        'You are now ready for the next step. Choose one of the templates below and click \'Create\' to create a download link for your new profile picture.'
      );
    } else {
      welcomeMsg = React.createElement(
        'p',
        null,
        'Please login with your Facebook account to use your profile picture. Be sure we store no data about you.'
      );
    }
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
          welcomeMsg
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
      url: '/templates/all',
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

  componentDidUpdate: function componentDidUpdate() {
    // This upgrades all upgradable components (i.e. with 'mdl-js-*' class)
    componentHandler.upgradeDom();
  },

  onSelectionChanged: function onSelectionChanged(e) {
    this.props.onTemplateSelected(e.currentTarget.value);
  },

  render: function render() {
    return React.createElement(
      'div',
      { className: 'template-select mdl-cell mdl-cell--12-col' },
      React.createElement(
        'div',
        { className: 'mdl-grid' },
        this.state.templates.map(function (template, idx) {
          var imageStyle = {
            background: "url('" + template.thumb + "') center / cover"
          };
          return React.createElement(
            'div',
            { key: idx,
              className: 'template-card-image mdl-card mdl-shadow--2dp \\ mdl-cell mdl-cell--3-col' },
            React.createElement('div', { className: 'mdl-card__title mdl-card--expand',
              style: imageStyle }),
            React.createElement(
              'div',
              { className: 'mdl-card__actions' },
              React.createElement(
                'span',
                { className: 'template-card-image__filename' },
                React.createElement(
                  'label',
                  {
                    className: 'mdl-radio mdl-js-radio mdl-js-ripple-effect',
                    htmlFor: "template" + template.id },
                  React.createElement('input', { type: 'radio', id: "template" + template.id,
                    className: 'mdl-radio__button', name: 'template',
                    value: template.id, onChange: this.onSelectionChanged }),
                  React.createElement(
                    'span',
                    { className: 'mdl-radio__label' },
                    template.title
                  )
                )
              )
            )
          );
        }.bind(this))
      )
    );
  }
});

var CausesView = React.createClass({
  displayName: 'CausesView',

  getInitialState: function getInitialState() {
    return {
      fbId: null,
      templateId: null,
      resultPhoto: null,
      loading: false
    };
  },

  onUserAuthenticated: function onUserAuthenticated(fbId) {
    this.setState({ fbId: fbId });
  },

  onTemplateSelected: function onTemplateSelected(templateId) {
    this.setState({ templateId: templateId });
  },

  onSubmit: function onSubmit(e) {
    this.setState({
      loading: true,
      resultPhoto: null
    });

    var requestUrl = '/templates/' + this.state.templateId + '/fbId/' + this.state.fbId;
    $.ajax({
      url: requestUrl,
      method: 'post',
      dataType: 'json',
      cache: false,
      success: function (response) {
        this.setState({
          resultPhoto: response.data.url,
          loading: false
        });
      }.bind(this),
      error: function (xhr, status, err) {
        console.log(err);
        this.setState({ loading: false });
      }.bind(this)
    });
  },

  componentDidUpdate: function componentDidUpdate() {
    // This upgrades all upgradable components (i.e. with 'mdl-js-*' class)
    componentHandler.upgradeDom();
  },

  render: function render() {
    var result, loadingClass;

    if (this.state.resultPhoto) {
      var imageStyle = {
        background: "url('" + this.state.resultPhoto + "') center / cover"
      };
      result = React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { className: 'result-card-image mdl-card mdl-shadow--2dp' },
          React.createElement('div', { className: 'mdl-card__title mdl-card--expand', style: imageStyle }),
          React.createElement(
            'div',
            { className: 'mdl-card__actions' },
            React.createElement(
              'span',
              { className: 'result-card-image__filename' },
              'Download',
              React.createElement(
                'a',
                { href: this.state.resultPhoto, download: true },
                React.createElement(
                  'i',
                  { className: 'material-icons md-36 download' },
                  'file_download'
                )
              )
            )
          )
        ),
        React.createElement('br', null),
        '* Download link will expire after one hour.'
      );
    }

    if (this.state.loading) {
      loadingClass = 'is-active is-upgraded';
    } else {
      loadingClass = '';
    }

    return React.createElement(
      'div',
      { className: 'causes-view mdl-grid' },
      React.createElement(FacebookAuth, { onUserAuthenticated: this.onUserAuthenticated }),
      React.createElement(TemplateSelect, { onTemplateSelected: this.onTemplateSelected }),
      React.createElement(
        'div',
        { className: 'submit-btn-container mdl-cell mdl-cell--12-col' },
        React.createElement(
          'button',
          { type: 'submit', onClick: this.onSubmit,
            className: 'mdl-button mdl-js-button mdl-button--raised \\ mdl-js-ripple-effect mdl-button--accent mdl-cell',
            disabled: !this.state.fbId || !this.state.templateId || this.state.loading },
          'Create'
        )
      ),
      React.createElement(
        'div',
        { className: 'result-container mdl-grid' },
        React.createElement('div', { className: "mdl-spinner mdl-js-spinner " + loadingClass }),
        result
      )
    );
  }

});