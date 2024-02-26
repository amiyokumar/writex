import InfiniteScroll from 'react-infinite-scroller';

class TableInfiniteScroll extends InfiniteScroll {
  getParentElement(el) {
    console.log(el);
    return el;
  }

  render() {
    return super.render();
  }
}

export default TableInfiniteScroll;
