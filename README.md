# APT Repository

```bash
curl \
    -F secret=secret \
    -F package=@mypackage.deb \
    -F packageName=mypackage.deb \
    http://127.0.0.1:8000/upload
```
