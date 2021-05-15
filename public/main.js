$(function () {
  function parseDate(item) {
    // source is ISO 8601
    const d = new Date(item.created_at);
    return d.toDateString();
  }

  function downloadCSV(event) {
    const batchId = $(event.target).data('ray-data')
    console.log(batchId)
    fetch(`/api/download/${batchId}`)
      .then( res => res.blob() )
      .then( blob => {
        var file = window.URL.createObjectURL(blob)
        window.location.assign(file)
      })
  }

  const dataTable = $('#dataTable').raytable({
    datasource: { data: [], keyfield: 'id' },
    columns: [
      { field: 'id', title: 'ID', sort: true },
      { field: 'amount', title: '数量', sort: true },
      { field: 'memo', title: '备注' },
      { field: 'created_at', title: '创建日期', sort: true, format: parseDate },
      { title: '下载', icons: [{ glyph: 'bi bi-download', handler: downloadCSV, data: 'id' }] }
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