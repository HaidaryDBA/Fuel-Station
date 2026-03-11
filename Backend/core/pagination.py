from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for high-volume models"""
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100
