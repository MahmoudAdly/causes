var FacebookAuth = React.createClass({
  propTypes: {
    onUserAuthenticated: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      loggedIn: false,
      fbName: '',
      fbId: 0
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
      this.setState({
        loggedIn: true,
        fbName: response.name,
        fbId: response.id
      }, function() {
        this.props.onUserAuthenticated(this.state.fbId);
      });
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
    FB.login(this.checkLoginState());
  },

  render: function() {
    return (
      <div className="facebook-auth">
        {(
          this.state.loggedIn ? <span>Welcome {this.state.fbName}</span>
            : <a href="#" onClick={this.handleClick}>Please login first</a>
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
      url: '/templates',
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
    this.setState({
      templateId: e.currentTarget.value
    }, function() {
      this.props.onTemplateSelected(this.state.templateId);
    });
  },

  render: function() {
    return (
      <div className="template-select">
        { this.state.templates.map(function(template, idx) {
            return(
              <span key={idx}>
                <input type="radio" name="template"
                  value={template.id} onChange={this.onSelectionChanged} />
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
      fbId: 0,
      templateId: 0
    }
  },

  onUserAuthenticated: function(fbId) {
    this.setState({ fbId: fbId });
    console.log(fbId);
  },

  onTemplateSelected: function(templateId) {
    this.setState({ templateId: templateId });
    console.log(templateId);
  },

  render: function() {
    return (
      <div className="causes-view">
        <FacebookAuth onUserAuthenticated={this.onUserAuthenticated}/>
        <hr />
        <TemplateSelect onTemplateSelected={this.onTemplateSelected} />
        <hr />
        <Result />
      </div>
    );
  }
});
