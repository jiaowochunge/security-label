$(function () {
  function parseDate(item)
  {
    // source is ISO 8601
    var d = new Date(item.created_at);
    return d.toDateString();
  }

  const dataTable = $('#dataTable').raytable({
    datasource: { data: [], keyfield: 'id' },
    columns: [
      { field: 'id', title: 'ID', sort: true },
      { field: 'amount', title: '数量', sort: true },
      { field: 'memo', title: '备注' },
      { field: 'created_at', title: '创建日期', sort: true, format: parseDate },
    ],
    pagesize: 20,
    maxPageButtons: 7,
    rowNumbers: { visible: true, 'title': '' },
    rowClickHandler: function(){}
  })

  fetch('/api/batches?page=0&size=1000')
    .then(response => response.json())
    .then(data => {
      if (data.code === 0) {
        dataTable.data(data.data.data, 'id')
      } else {
        console.log(data.message)
      }
    })
})