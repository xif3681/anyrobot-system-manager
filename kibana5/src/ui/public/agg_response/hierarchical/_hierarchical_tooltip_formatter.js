import _ from 'lodash';
import $ from 'jquery';
import collectBranch from 'ui/agg_response/hierarchical/_collect_branch';
import numeral from 'numeral';
export default function HierarchicalTooltipFormaterProvider($rootScope, $compile, $sce) {
  let $tooltip = $(require('ui/agg_response/hierarchical/_tooltip.html'));
  let $tooltipScope = $rootScope.$new();

  $compile($tooltip)($tooltipScope);

  return function (columns) {
    return function (event) {
      let datum = event.datum;

      // Collect the current leaf and parents into an array of values
      $tooltipScope.rows = collectBranch(datum);
      $tooltipScope.metricCol = _.find(columns, {categoryName: 'metric'});
      //饼图, 添加自定义标签
      if ($tooltipScope.metricCol.aggConfig.params && $tooltipScope.metricCol.aggConfig.params.customLabel) {
        $tooltipScope.metricCol.label = $tooltipScope.metricCol.aggConfig.params.customLabel;
      }
      let metricCol = $tooltipScope.metricCol;
      // Map those values to what the tooltipSource.rows format.
      _.forEachRight($tooltipScope.rows, function (row, i, rows) {
        row.spacer = $sce.trustAsHtml(_.repeat('&nbsp;', row.depth));

        let percent;
        if (row.item.percentOfGroup != null) {
          percent = row.item.percentOfGroup;
        }

        row.metric = metricCol.aggConfig.fieldFormatter()(row.metric);

        if (percent != null) {
          row.metric += ' (' + numeral(percent).format('0.[00]%') + ')';
        }
        //饼图, 添加自定义标签
        if (row.aggConfig && row.aggConfig.params && row.aggConfig.params.customLabel) {
          row.field = row.aggConfig.params.customLabel;
        }
        return row;
      });

      $tooltipScope.$apply();
      return $tooltip[0].outerHTML;
    };

  };

};
