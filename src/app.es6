import React from 'react'
import { render } from 'react-dom'
import { Router, Route, Link, browserHistory, RouteHandler } from 'react-router'
import { createStore } from 'redux'

import  AddNameEmail  from './add-name-email'

var userList = [];

// sample redux stuff
// --------------------------------------------
// The Reducer Function
var userReducer = function(state, action) {
  if (state === undefined) {
    state = [];
  }
  if (action.type === 'ADD_USER') {
    console.log(action.user);
    state = action.user;
  }
  return state;
}

// Create a store by passing in the reducer
var userStore = createStore(userReducer);

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
    userStore.subscribe(function() {
      var tmpList = self.state.list;
      tmpList.push(userStore.getState());
      console.log("getState", userStore.getState());
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
              <AddNameEmail dispatchItem={self.reduxDispatch}/>
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

       // this feels wrong.
       var newName = document.getElementById('newName').value;
       var newEmail = document.getElementById('newEmail').value;

       userStore.dispatch({
         type: 'ADD_USER',
         user: {name:newName, email:newEmail}
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

var MainLayout = React.createClass({
    render: function() {
        return (<div>
                  <span>Header:</span>
                  <Link to="/">Home</Link> |
                  <Link to="/users">Users</Link> |

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
