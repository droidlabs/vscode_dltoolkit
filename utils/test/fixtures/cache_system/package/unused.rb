class CacheSystem::Unused
  bean :unused

  inject :unused_examples

  def handle
    # don't calling for any injected beans
  end
end