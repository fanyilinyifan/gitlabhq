module Gitlab
  module Prometheus
    class MetricGroup
      include ActiveModel::Model

      attr_accessor :name, :priority, :metrics
      validates :name, :priority, :metrics, presence: true

      def self.common_metrics
        AdditionalMetricsParser.load_groups_from_yaml
      end

      def self.for_project(project)
        common_metrics + custom_metrics(project)
      end

      def self.custom_metrics(project)
        project.prometheus_metrics.to_grouped_query_metrics.map do |name, metrics|
          MetricGroup.new(name: name, priority: 0, metrics: metrics)
        end
      end
    end
  end
end
