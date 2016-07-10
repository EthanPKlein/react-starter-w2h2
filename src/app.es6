import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, browserHistory, RouteHandler } from 'react-router'
import { createStore } from 'redux'


var userList = [];

// sample redux stuff
// --------------------------------------------
// The Reducer Function
var dummyReducer = function(state, action) {
  if (state === undefined) {
    state = [];
  }
  if (action.type === 'ADD_USER') {
    state = action.user;
  }
  return state;
}

// Create a store by passing in the reducer
var dummyStore = createStore(dummyReducer);

//---------------------------------------------

var Home = React.createClass({
    render: function() {
        return (<div>
                <p>Welcome to the Home Page...</p>
              </div>);
    }
});

class Users extends React.Component {
  constructor(props) {
   super(props);
   this.state = {list:[]};
   this.render = this.render.bind(this);
   this.clickHandler = this.clickHandler.bind(this);
   this.reduxDispatch = this.reduxDispatch.bind(this);
  }

  componentDidMount() {
    var self = this;
    $.getJSON('/data.json').done(function (data) {
      userList = data.list;
      self.setState({
        list : data.list
      });
    });

    // magic of redux here below ,this listens for chagnes to the dummy store and udpates the state
    dummyStore.subscribe(function() {
      var tmpList = self.state.list;
      tmpList.push(dummyStore.getState());
      console.log("getState",dummyStore.getState());
      self.setState(tmpList);
    });
  }

  render() {
    var self = this;
    var list = this.state.list;
    return (
            <div>
              <ul>
              {list.map(function(item, i) {
                  return <li><Link to={`/users/${i}`}>{item.name}</Link> - {item.email}</li>
              })}
              </ul>
              <button onClick={self.clickHandler}>Test Clicker</button>
              <button onClick={self.reduxDispatch}>Dispatch</button>
              <AddNameEmail />
            </div>
    );
  }

  clickHandler() {
       console.log('so this was a click event, now you can use a similar event to "save"', this.state);
       var tmpState = this.state.list;
       tmpState.push({name:"hello world", email:'hello@icct.com'});
       this.setState({list:tmpState});
   }

  reduxDispatch() {
       console.log('dispatched...');
       dummyStore.dispatch({
         type: 'ADD_USER',
         user: {name:"dummy dummy", email:'dummy@icct.com'}
       });
  }
}

var UsersDetail = React.createClass({
    render: function() {
      var id = this.props.params.id;
      var userDetail = userList[id] || {name:'',email:''};
        return (
                <div>
                  <div>name: {userDetail.name}</div>
                  <div>email: {userDetail.email}</div>
                </div>

        );
  }
});

var Ethan = React.createClass({
    render: function() {
		var id = this.props.params.id;
        return (
                <div>
                  Ethan route ftw!!!!!  You specified {id}
                </div>
        );
  }
});

var AddNameEmail = React.createClass({
    getInitialState: function() {
      return {name: '', email: '...@icct.com'};
    },
    handleNameChange: function(e) {
      console.log("handling name change... ''" + this.state.name + "''");
      this.setState({name: e.target.value});
    },
    handleEmailChange: function(e) {
      console.log("handling email change... ''" + this.state.email + "''");
      this.setState({email: e.target.value});
    },
    handleSubmit: function(e) {
      e.preventDefault();
      console.log("Submitting name: " + this.state.name);
      console.log("Submitting email: " + this.state.email);

      // TODO:  Save state to Redux
      this.setState({name: '', email: ''});
  },
    render: function() {
        return (
                <div style={{border: '1px solid black'}}>
                    <form onSubmit={this.handleSubmit}>
                      <span>Name:</span>
                      <input type="text" placeholder="Bob Bobbyson" value={this.state.name}
          onChange={this.handleNameChange}/><br />
                      <span>Email:</span>
                      <input type="text" placeholder="bb@bobbyson.net" value={this.state.email}
          onChange={this.handleEmailChange}/><br />
                      <input type="submit" value="Submit" />
                    </form>
                </div>
        );
  }
});

var MainLayout = React.createClass({
    render: function() {
        return (<div>
                  <span>Header:</span>
                  <Link to="/">Home</Link> |
                  <Link to="/users">Users</Link>
                  <Link to="/Ethan/hello">Ethan!!!</Link>
                  <hr/>
                  <div>
                    <h2>Body Content</h2>
                  {this.props.children}
                  </div>
                  <div><hr/>footer</div>
                </div>);
    }
});

ReactDOM.render((
  <Router>
    <Route component={MainLayout}>
      <Route path="/" component={Home} />
      <Route path="/users" component={Users} />
      <Route path="/users/:id" component={UsersDetail} />
      <Route path="/Ethan/:id" component={Ethan} />
    </Route>
  </Router>
), document.getElementById('app'));
