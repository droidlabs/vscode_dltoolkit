class CacheSystem::UnusedDuplicated
  bean :unused_duplicated

  inject :unused_examples
  inject :duplicated_examples
  inject :duplicated_examples
  inject :project_repository

  def handle
    project_repository.create(
      duplicated_examples.build_project
    )
  end
end