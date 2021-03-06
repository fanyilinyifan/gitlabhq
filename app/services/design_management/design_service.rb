# frozen_string_literal: true

module DesignManagement
  class DesignService < ::BaseService
    def initialize(project, user, params = {})
      super

      @issue = params.fetch(:issue)
    end

    # Accessors common to all subclasses:

    attr_reader :issue

    def target_branch
      repository.root_ref || "master"
    end

    def collection
      issue.design_collection
    end

    def repository
      collection.repository
    end

    def project
      issue.project
    end
  end
end
