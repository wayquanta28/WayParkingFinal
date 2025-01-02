// searchService.ts
export class SearchService {
    constructor(private activatedRoute: any) {} // ActivatedRoute will be passed when instantiating this class
  
    initializeSearch(
      searchInputId: string, 
      searchButtonId: string, 
      searchFeatureById: (featureId: string) => void,
      fetchPlaceNames: () => void
    ): void {
      const searchInput = document.getElementById(searchInputId) as HTMLInputElement;
      const searchButton = document.getElementById(searchButtonId) as HTMLButtonElement;
  
      // Fetch 'placeName' from the query parameters instead of route parameters
      this.activatedRoute.queryParams.subscribe((params: any) => {
        const placeName = params['placeName']; // Extract 'placeName' from query parameters
  
        if (placeName && searchInput) {
          // Set the search input value to the placeName from the query string
          searchInput.value = decodeURIComponent(placeName); // Decode the URL-encoded value
          const featureId1 = searchInput.value.trim();
          searchFeatureById(featureId1);
        }
      });
  
      if (searchButton && searchInput) {
        // Reusable function to trigger the search by featureId (extracted from input)
        const triggerSearch = () => {
          const featureId = searchInput.value.trim();
          if (featureId) {
            searchFeatureById(featureId); // Call the search feature method
          } else {
            console.warn('Please enter a feature ID.');
          }
        };
  
        // Event listener for button click
        searchButton.addEventListener('click', () => {
          triggerSearch();
        });
  
        // Event listener for pressing "Enter" key
        searchInput.addEventListener('keyup', (event: KeyboardEvent) => {
          if (event.key === 'Enter') {
            triggerSearch(); // Trigger search on pressing Enter
          }
        });
      }
  
      // Fetch place names for the datalist if necessary
      fetchPlaceNames();
    }
  }
  