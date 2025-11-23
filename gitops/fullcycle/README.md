## Site ARGOCD
https://argo-cd.readthedocs.io/en/stable/

## Port forward
k port-forward svc/argocd-server -n argocd 8080:443

## Get password ARGOCD local
k -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo