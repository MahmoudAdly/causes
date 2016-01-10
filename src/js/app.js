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
      <div className="facebook-auth">
        {(
          this.state.loggedIn ? <span>Welcome {this.state.fbName}</span>
            : <a href="javascript:;" onClick={this.handleClick}>Please login first</a>
        )}
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
      <div className="template-select">
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
      <div className="causes-view">
        <FacebookAuth onUserAuthenticated={this.onUserAuthenticated} />
        <hr/>
        <TemplateSelect onTemplateSelected={this.onTemplateSelected} />
        <input type="submit" value="Create" onClick={this.onSubmit}
          disabled={!this.state.fbId || !this.state.templateId} />
        <hr/>
        <Result />
      </div>
    );
  }

});
