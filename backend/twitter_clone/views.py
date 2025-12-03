from django.http import HttpResponse
from django.template import loader
from django.views.decorators.csrf import csrf_exempt

import subprocess

import git
import os

# SECRET_TOKEN = os.environ.get("DEPLOY_TOKEN", "b5e64baa94062020344a75d0080f0862d56b39f5")

@csrf_exempt
def update_server(request):
    if request.method == "POST":
        # token = request.headers.get("X-Deploy-Token")
        # if token != SECRET_TOKEN:
        #     return JsonResponse({"error": "Unauthorized"}, status=403)

        # Abre o repositório na raiz
        repo = git.Repo('/home/ricardoferreirajr/twitter-clone-fixed/')
        origin = repo.remotes.origin

        # Puxa sempre a branch deploy/pythonanywhere
        origin.pull('deploy/pythonanywhere')

        # Executa migrations
        subprocess.call([
            "python3", "/home/ricardoferreirajr/twitter-clone-fixed/backend/manage.py", "migrate", "--noinput"
        ])

        # Coleta arquivos estáticos
        subprocess.call([
            "python3", "/home/ricardoferreirajr/twitter-clone-fixed/backend/manage.py", "collectstatic", "--noinput"
        ])

        # Força reload da aplicação
        subprocess.call([
            "touch", "/var/www/ricardoferreirajr_pythonanywhere_com_wsgi.py"
        ])

        return HttpResponse("Deploy automático concluído com sucesso!")
    return HttpResponse("Método inválido")


# def hello_world(request):
#     template = loader.get_template('hello_world.html')
#     return HttpResponse(template.render())
