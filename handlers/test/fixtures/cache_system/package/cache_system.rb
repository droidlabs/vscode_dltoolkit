class CacheSystem::CacheSystem
  bean :cache_system

  inject :project_repository
  inject :project_creator

  def handle
    project_repository.put(
      project_creator.create(
        some: :data
      )
    )
  end
end