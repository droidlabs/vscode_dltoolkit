class UpdateCacheForProject
  bean 'update_cache_for_project'

  inject :repository, ref: :project_repository
  inject :project_creator
end