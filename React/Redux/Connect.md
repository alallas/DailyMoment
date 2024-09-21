
- 使用：

```
const mapStateToProps=(state)=>({
  counter:state.counter.counter,
  banners:state.home.banners,
  recommends:state.home.recommends,
})

const mapDispatchToProps=(dispatch)=>({
  addNumber:(num)=>dispatch(addNumberAction(num)),
  subNumber:(num)=>dispatch(subNumberAction(num)),
})

export default connect(mapStateToProps,mapDispatchToProps)(About)


// 组件处可以使用对象key的props
const { counter,addNumber,subNumber,banners } =this.props;
```



- 源码：

这个store可以利用上下文，在`<App>`那边通过provider传递，这边用`NewComponent.contextType = StoreContext`和`constructor(props, context) {}`来拿到，此时的store就是`this.context`


```
import { store } from './store'

export function connect(mapStateToProps, mapDispatchToProps) {
  return function(WrappedComponent) {

    // 使用pureComponent可以避免state和props不必要的更新
    class NewCompoent extends PureComponent {

      constructor(props) {
        super(props)
        this.state = mapStateToProps(store.getState())
      }

      componentDidMount() {
        this.unsubscribe = store.subscribe(() => {

          // 一旦dispatch改变了state，就执行这个callback，强制重新更新渲染组件
          // mapStateToProps(store.getState())相当于selector，拿到最新的state的一部分！
          this.setState(mapStateToProps(store.getState()))
        })
      }

      componentWillUnmount() {
        this.unsubscribe()
      }

      render() {
        // 给组件加上props，包括state和dispatch，需要外部来定义
        const stateObj = mapStateToProps(store.getState())
        const dispatchObj = mapDispatchToProps(store.dispatch)
        return (
          <WrappedComponent {...this.props} {...stateObj} {...dispatchObj}/>
        )
      }
    }

    // 返回受到包裹的新的组件
    return NewCompoent
  }
}
```