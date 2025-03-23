import { connect } from "react-redux";
import { action } from "./store";

import styles from "./style.css";

const About = (props) => {

  if (props.staticContext) {
    // 将各个子路由的css推入数组，改变传入的context
    props.staticContext.css.push(styles._getCss());
  }

  useEffect(() => {
    props.getList();
  }, []);

  return (
    <div className={styles.title}>About</div>
  )
}

About.loadData = (store) => {
  // 如果这个子组件涉及到要调用多个异步函数，用promise.all
  // return Promise.all([store.dispatch(action.getHomeList())]);

  return new Promise((resolve, reject) => {
    resolve(store.dispatch(action.getHomeList()))
  })

};

const mapStateToProps = (state) => ({
  name: state.about.name,
  age: state.about.age,
  list: state.about.list,
});

const mapDispatchToProps = (dispatch) => ({
  getList: function() {
    dispatch(action.getHomeList());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(About);

