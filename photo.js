(function(window, document, undefined) {
  //对照片进行分组
  function group(photos) {
    var results = {};
  
    var length = photos.length;
    for (var i=0; i < length; i++) {
      var time = new Date(photos[i].time),
          currentYear = time.getFullYear(),
          currentMonth = ('0' + time.getMonth() + 1).slice(-2),
          currentDay = time.getDate(),
          date = currentYear + '-' + currentMonth + '-' + currentDay;
      if (date in results) {
        results[date].push(photos[i]);
      } else {
        results[date] = [photos[i]];
      }
    }

    return results;
  }
  //同步ajax获取数据
  function ajax(url) {
    var req = new XMLHttpRequest(),
        res;
    req.open('GET', url, false);
    req.send();
    if (req.status === 200) {
      res = req.responseText;
    }
    return res;
  }
  //等比缩放图像
  function resizeImage(width, height, defaultWidth) {
    var max = Math.max(width, height);
    if (max <= defaultWidth) {
      return {
        width: width,
        height: height
      };
    } else {
      var proportion = defaultWidth / width;
      return {
        width: defaultWidth,
        height: height * proportion
      };
    }
  }
  //将图像插入到页面
  function showImage(data) {
    var fragment = document.createDocumentFragment();
    var DEFAULT_WIDTH = 160;
    for (var date in data) {
      var currentData = data[date],
          length = currentData.length;
      var title = document.createElement('p');
      title.appendChild(document.createTextNode(date));
      fragment.appendChild(title);
      var lineContainer = document.createElement('p');
      for (var i = 0; i < length; i++) {
        var image = new Image(),
            currentImage = currentData[i],
            width = currentImage.width,
            height = currentImage.height;
        newPropotion = resizeImage(width, height, DEFAULT_WIDTH);
        image.src = currentImage.imageURL;
        image.width = newPropotion.width;
        image.height = newPropotion.height;
        lineContainer.appendChild(image);
        if (i % 5 === 4 || i === length - 1) {
          fragment.appendChild(lineContainer);

          lineContainer = document.createElement('p'); 
        }
      }
    }
    document.getElementById('photo').appendChild(fragment);
  }
  //获取下一页数据
  function next(url) {
    window.removeEventListener('scroll', handler, false);
    var response;
    if (typeof url === 'string') {
      response = JSON.parse(ajax(url));
    } else {
      response = JSON.parse(ajax(next.url));
    }
    next.url = response.nextURL;
    var res = group(response.photos);
    showImage(res);
    window.addEventListener('scroll', handler, false);
  }
  //判断页面是否滚动到底部
  function handler() {
    var clientHeight = document.documentElement.clientHeight;
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var offsetHeight = document.body.offsetHeight;
    if (offsetHeight <= scrollTop + clientHeight) {
      next();
      document.documentElement.scrollTop = scrollTop;
    }
  }
  
  function init(url) {    
    window.addEventListener('scroll', handler, false);
    next(url); 
  }
  //暴露接口到window对象
  window.photo = window.photo || {};
  photo.sync = init;
})(this, document);

photo.sync('http://photo-sync.herokuapp.com/photos');