/**
 * Created by chang_su on 2017/6/15.
 */
export default function (_pickBtn,_pickBox,load,upNum,func,max_file_size,startCb,completeCb) {
  var uploader = Qiniu.uploader({
    runtimes: 'html5,flash,html4',
    browse_button: _pickBtn,
    container: _pickBox,
    drop_element: 'container',
    //max_file_size: '100mb',
    max_file_size: max_file_size||'100mb',
    flash_swf_url: 'js/plupload/Moxie.swf',
    max_retries: 3,
    dragdrop: true,
    unique_names: true,
    multi_selection:true,//false 为单选
    filters : {
      mime_types: [
        {title : "Image files", extensions : "jpg,gif,png,jpeg,bmp"}
      ]
    },
    chunk_size: '4mb',
    //uptoken_url: '/p/wedding/home/APIUtils/image_upload_token',
    uptoken_url: '/saas/index.php/Api/APIQiniu/getImageToken',
    domain: 'http://s.yunkexiongdi.com/',
    auto_start: true,
    init: {
      'FilesAdded': function(up, files) {

        if(load != ''){load()}
      },
      'BeforeUpload': function(up, file) {
        var fileSize = plupload.formatSize(file.size).toUpperCase();
        var _name = file.name;
        //console.log('大小:'+fileSize)
        startCb&&startCb()
      },
      'UploadProgress': function(up, file) {
        // console.log(file.percent)
        var percent = file.percent;
        if(upNum != ''){upNum(percent)}
      },
      'UploadComplete': function() {
        completeCb&&completeCb()
      },
      'FileUploaded': function(up, file, info) {

        var domain = up.getOption('domain');
        var res = JSON.parse(info);
        // console.log(file)
        //	sourceLink = domain + res.image_path;
        var sourceLink = domain + res.image_path;
        func && func(sourceLink);
      },
      'Error': function(up, err, errTip) {
        if(err.code === -600){
          alert('文件大小超过限制');
        }
      }
    }
  });

}
