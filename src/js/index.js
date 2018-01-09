
$(document).ready(function(){
  getData();
})

function getData(){
  $.ajax({
    url:'./mock/data.json',
    type: 'get',
    data: 'json',
    success: function(data){
      document.write(JSON.stringify(data));
    },
    error: function(){
      console.log('服务器出bug了')
    }
  })
}
  