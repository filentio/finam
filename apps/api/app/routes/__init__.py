from app.routes.applications import router as applications_router
from app.routes.auth_hh import router as auth_hh_router
from app.routes.cover_letters import router as cover_letters_router
from app.routes.health import router as health_router
from app.routes.search_profiles import router as search_profiles_router
from app.routes.vacancies import router as vacancies_router

__all__ = [
    "health_router",
    "auth_hh_router",
    "search_profiles_router",
    "vacancies_router",
    "cover_letters_router",
    "applications_router",
]

