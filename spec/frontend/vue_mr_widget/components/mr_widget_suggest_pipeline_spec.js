import { mount, shallowMount } from '@vue/test-utils';
import { GlLink, GlSprintf } from '@gitlab/ui';
import suggestPipelineComponent from '~/vue_merge_request_widget/components/mr_widget_suggest_pipeline.vue';
import MrWidgetIcon from '~/vue_merge_request_widget/components/mr_widget_icon.vue';
import dismissibleContainer from '~/vue_shared/components/dismissible_container.vue';
import { mockTracking, triggerEvent, unmockTracking } from 'helpers/tracking_helper';
import { suggestProps, iconName } from './pipeline_tour_mock_data';
import axios from '~/lib/utils/axios_utils';
import MockAdapter from 'axios-mock-adapter';
import {
  SP_TRACK_LABEL,
  SP_LINK_TRACK_EVENT,
  SP_SHOW_TRACK_EVENT,
  SP_LINK_TRACK_VALUE,
  SP_SHOW_TRACK_VALUE,
  SP_HELP_URL,
} from '~/vue_merge_request_widget/constants';

describe('MRWidgetSuggestPipeline', () => {
  describe('template', () => {
    let wrapper;

    afterEach(() => {
      wrapper.destroy();
    });

    describe('core functionality', () => {
      const findOkBtn = () => wrapper.find('[data-testid="ok"]');
      let trackingSpy;
      let mockAxios;

      const mockTrackingOnWrapper = () => {
        unmockTracking();
        trackingSpy = mockTracking('_category_', wrapper.element, jest.spyOn);
      };

      beforeEach(() => {
        mockAxios = new MockAdapter(axios);
        document.body.dataset.page = 'projects:merge_requests:show';
        trackingSpy = mockTracking('_category_', undefined, jest.spyOn);

        wrapper = mount(suggestPipelineComponent, {
          propsData: suggestProps,
          stubs: {
            GlSprintf,
          },
        });
      });

      afterEach(() => {
        unmockTracking();
        mockAxios.restore();
      });

      it('renders add pipeline file link', () => {
        const link = wrapper.find(GlLink);

        expect(link.exists()).toBe(true);
        expect(link.attributes().href).toBe(suggestProps.pipelinePath);
      });

      it('renders the expected text', () => {
        const messageText = /\s*No pipeline\s*Add the .gitlab-ci.yml file\s*to create one./;

        expect(wrapper.text()).toMatch(messageText);
      });

      it('renders widget icon', () => {
        const icon = wrapper.find(MrWidgetIcon);

        expect(icon.exists()).toBe(true);
        expect(icon.props()).toEqual(
          expect.objectContaining({
            name: iconName,
          }),
        );
      });

      it('renders the show me how button', () => {
        const button = findOkBtn();

        expect(button.exists()).toBe(true);
        expect(button.classes('btn-info')).toEqual(true);
        expect(button.attributes('href')).toBe(suggestProps.pipelinePath);
      });

      it('renders the help link', () => {
        const link = wrapper.find('[data-testid="help"]');

        expect(link.exists()).toBe(true);
        expect(link.attributes('href')).toBe(SP_HELP_URL);
      });

      it('renders the empty pipelines image', () => {
        const image = wrapper.find('[data-testid="pipeline-image"]');

        expect(image.exists()).toBe(true);
        expect(image.attributes().src).toBe(suggestProps.pipelineSvgPath);
      });

      describe('tracking', () => {
        it('send event for basic view of the suggest pipeline widget', () => {
          const expectedCategory = undefined;
          const expectedAction = undefined;

          expect(trackingSpy).toHaveBeenCalledWith(expectedCategory, expectedAction, {
            label: SP_TRACK_LABEL,
            property: suggestProps.humanAccess,
          });
        });

        it('send an event when add pipeline link is clicked', () => {
          mockTrackingOnWrapper();
          const link = wrapper.find('[data-testid="add-pipeline-link"]');
          triggerEvent(link.element);

          expect(trackingSpy).toHaveBeenCalledWith('_category_', SP_LINK_TRACK_EVENT, {
            label: SP_TRACK_LABEL,
            property: suggestProps.humanAccess,
            value: SP_LINK_TRACK_VALUE.toString(),
          });
        });

        it('send an event when ok button is clicked', () => {
          mockTrackingOnWrapper();
          const okBtn = findOkBtn();
          triggerEvent(okBtn.element);

          expect(trackingSpy).toHaveBeenCalledWith('_category_', SP_SHOW_TRACK_EVENT, {
            label: SP_TRACK_LABEL,
            property: suggestProps.humanAccess,
            value: SP_SHOW_TRACK_VALUE.toString(),
          });
        });
      });
    });

    describe('dismissible', () => {
      const findDismissContainer = () => wrapper.find(dismissibleContainer);

      beforeEach(() => {
        wrapper = shallowMount(suggestPipelineComponent, { propsData: suggestProps });
      });

      it('renders the dismissal container', () => {
        expect(findDismissContainer().exists()).toBe(true);
      });

      it('emits dismiss upon dismissal button click', () => {
        findDismissContainer().vm.$emit('dismiss');

        expect(wrapper.emitted().dismiss).toBeTruthy();
      });
    });
  });
});
