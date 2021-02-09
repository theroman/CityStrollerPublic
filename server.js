function handle(request, response) {
  let path = request.path;
  let d = new Date()
  console.log(`${path} was called [${d.toLocaleString()}]`)
  if (path === '/') {
    path += 'index.html';
  }
  if (path === '/add_point') {
    localStorage.setItem(request.param.id, request.param.data);
    response.sendJSON({ 'status': 'ok' });

  } else if (path === '/all_points') {
    const allPoints = { ...localStorage };
    response.sendJSON(allPoints);
    response.sendJSON({ 'status': 'ok' });

  } else if (path === '/remove_point') {
    localStorage.removeItem(request.param.id);
    response.sendJSON({ 'status': 'ok' });

  } else if (path === "/client_exception") {
    console.log(`Got the following exception: ${request.param.exception}`)
  } else {
    getFile('public' + path).subscribe(file => {
      response.sendFile(file);
    }, err => {
      response.sendText('Page not found');
    });
  }
}
