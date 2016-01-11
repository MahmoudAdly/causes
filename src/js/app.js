var FacebookAuth = React.createClass({
  propTypes: {
    onUserAuthenticated: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      loggedIn: false,
      fbName: ''
    }
  },

  componentDidMount: function() {
    window.fbAsyncInit = function() {
      FB.init({
        appId      : '1157541270945658',
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.2' // use version 2.2
      });

      this.checkLoginState();
    }.bind(this);

    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  },

  getUserData: function() {
    FB.api('/me', function(response) {
      this.setState({ loggedIn: true, fbName: response.name });
      this.props.onUserAuthenticated(response.id);
    }.bind(this));
  },

  statusChangeCallback: function(response) {
    if (response.status === 'connected') {
      this.getUserData();
    } else if (response.status === 'not_authorized') {
      this.setState({loggedIn: false})
    } else {
      this.setState({loggedIn: false})
    }
  },

  checkLoginState: function() {
    FB.getLoginStatus(function(response) {
      this.statusChangeCallback(response);
    }.bind(this));
  },

  handleClick: function() {
    FB.login(function() {
      this.checkLoginState();
    }.bind(this));
  },

  render: function() {
    return (
      <div className="facebook-auth mdl-cell mdl-cell--12-col">
        <div className="fb-card-wide mdl-card mdl-shadow--2dp">
          <div className="mdl-card__title">
            <h2 className="mdl-card__title-text">
              Welcome
              {(
                this.state.loggedIn ? <span>, {this.state.fbName}!</span> : false
              )}
            </h2>
          </div>
          <div className="mdl-card__supporting-text">
            Please login with your Facebook account to load your profile picture.
            Be sure we store no data about you.
          </div>
          <div className="mdl-card__actions mdl-card--border">
            {(
              this.state.loggedIn ? <i className="material-icons md-36 green">check_circle</i> :
                <a
                  className="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect"
                  href="javascript:;" onClick={this.handleClick}>
                  Login
                </a>
            )}
          </div>
        </div>
      </div>
    );
  }
});

var TemplateSelect = React.createClass({
  propTypes: {
    onTemplateSelected: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      templates: []
    }
  },

  componentDidMount: function() {
    $.ajax({
      url: '/causes/templates/all',
      dataType: 'json',
      cache: false,
      success: function(response) {
        this.setState({templates: response.data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(err);
      }.bind(this)
    });
  },

  onSelectionChanged: function (e) {
    this.props.onTemplateSelected(e.currentTarget.value);
  },

  render: function() {
    return (
      <div className="template-select mdl-cell mdl-cell--12-col">
        { this.state.templates.map(function(template, idx) {
            return(
              <span key={idx}>
                <input type="radio" name="template"
                  value={template.id} onChange={this.onSelectionChanged} />
                <img src={template.photo} style={{maxWidth:'48px'}}/>
                {template.title}
              </span>
            );
          }.bind(this))}
      </div>
    );
  }
});

var Result = React.createClass({
  getInitialState: function() {
    return {

    }
  },
  render: function() {
    return (
      <div className="result">
        result
      </div>
    );
  }
});

var CausesView = React.createClass({
  getInitialState: function() {
    return {
      fbId: null,
      templateId: null
    }
  },

  onUserAuthenticated: function(fbId) {
    this.setState({ fbId: fbId });
  },

  onTemplateSelected: function(templateId) {
    this.setState({ templateId: templateId });
  },

  onSubmit: function(e) {
    var requestUrl = '/causes/templates/' + this.state.templateId
      + '/fbId/' + this.state.fbId;
    $.ajax({
      url: requestUrl,
      method: 'post',
      dataType: 'json',
      cache: false,
      success: function(response) {
        this.setState({photoUrl: response.data.photoUrl});
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(err);
      }.bind(this)
    });
  },

  render: function() {
    return (
      <div className="causes-view mdl-grid">
        <FacebookAuth onUserAuthenticated={this.onUserAuthenticated} />
        <hr/>
        <TemplateSelect onTemplateSelected={this.onTemplateSelected} />
        <button type="submit" onClick={this.onSubmit}
          className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
          disabled={!this.state.fbId || !this.state.templateId}>Create</button>
        <hr/>
        <Result />
      </div>
    );
  }

});
