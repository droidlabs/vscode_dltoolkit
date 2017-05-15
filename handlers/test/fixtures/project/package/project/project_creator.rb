class Project::ProjectCreator
  bean :project_creator

  inject :project_repository

  def handle(data)
    project_repository.put(data)
  end
end