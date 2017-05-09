class CacheSystem::Duplicated
  bean :duplicated

  inject :duplicated_examples
  inject :duplicated_examples
  inject :duplicated_examples

  def handle
    duplicated_examples.call_some_method
  end
end