package net.javaguides.ims_backend.service;

import net.javaguides.ims_backend.dto.CategoryDTO;
import net.javaguides.ims_backend.dto.ProductDTO;
import net.javaguides.ims_backend.dto.SizeQuantityDTO;
import net.javaguides.ims_backend.entity.Category;
import net.javaguides.ims_backend.entity.Product;
import net.javaguides.ims_backend.entity.SizeQuantity;
import net.javaguides.ims_backend.repository.CategoryRepository;
import net.javaguides.ims_backend.repository.ProductRepository;
import net.javaguides.ims_backend.repository.SizeQuantityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SizeQuantityRepository sizeQuantityRepository;

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAllWithSubcategoriesAndSizes().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO addProduct(ProductDTO productDTO) {
        Product product = new Product();
        mapDTOToEntity(productDTO, product);

        // Generate productId based on category
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        String categoryName = category.getCategoryName();
        if (categoryName == null || categoryName.isEmpty()) {
            throw new RuntimeException("Category name cannot be empty");
        }

        // Use the first three letters of the category name (or full name if shorter) as the prefix
        String categoryPrefix = categoryName.length() >= 3 ? categoryName.substring(0, 3).toUpperCase() : categoryName.toUpperCase();
        String maxProductId = productRepository.findMaxProductIdByCategoryPrefix(categoryPrefix);
        int nextNumber = 1;
        if (maxProductId != null) {
            try {
                String numericPart = maxProductId.substring(categoryPrefix.length()).replaceAll("^0+", "");
                nextNumber = numericPart.isEmpty() ? 1 : Integer.parseInt(numericPart) + 1;
            } catch (NumberFormatException e) {
                throw new RuntimeException("Invalid product ID format in database: " + maxProductId);
            }
        }
        String formattedNumber = String.format("%03d", nextNumber);
        String generatedProductId = categoryPrefix + formattedNumber;
        product.setProductId(generatedProductId);

        // Initialize sizeQuantities list to avoid null
        if (productDTO.getHasSizes() && productDTO.getSizeQuantities() != null) {
            product.setSizeQuantities(new ArrayList<>());
        }

        // Calculate inStock based on quantities
        int totalQuantity = calculateTotalQuantity(productDTO);
        product.setInStock(totalQuantity > 0);

        Product savedProduct = productRepository.save(product);

        // Delete any existing SizeQuantity entries for this product
        if (savedProduct.getId() != null) {
            sizeQuantityRepository.deleteByProductId(savedProduct.getId());
        }

        // Save size-quantity pairs if applicable and associate with the saved product
        if (productDTO.getHasSizes() && productDTO.getSizeQuantities() != null) {
            // Clear the existing list (JPA will handle orphan removal)
            savedProduct.getSizeQuantities().clear();
            // Add new SizeQuantity entities to the existing list
            Set<String> uniqueSizes = new HashSet<>();
            for (SizeQuantityDTO sqDTO : productDTO.getSizeQuantities()) {
                if (sqDTO.getSize() != null && uniqueSizes.add(sqDTO.getSize())) {
                    SizeQuantity sizeQuantity = new SizeQuantity();
                    sizeQuantity.setProduct(savedProduct);
                    sizeQuantity.setSize(sqDTO.getSize());
                    sizeQuantity.setQuantity(sqDTO.getQuantity());
                    savedProduct.getSizeQuantities().add(sizeQuantity);
                }
            }
            // Persist the updated product with the modified sizeQuantities list
            productRepository.save(savedProduct);
        }

        return convertToDTO(savedProduct);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        mapDTOToEntity(productDTO, product);

        // Delete existing size-quantity entries from the database
        sizeQuantityRepository.deleteByProductId(product.getId());

        // Clear in-memory size-quantity pairs (JPA will handle orphan removal)
        product.getSizeQuantities().clear();

        int totalQuantity = calculateTotalQuantity(productDTO);
        product.setInStock(totalQuantity > 0);

        Product updatedProduct = productRepository.save(product);

        // Update size-quantity pairs if applicable
        if (productDTO.getHasSizes() && productDTO.getSizeQuantities() != null) {
            // Add new SizeQuantity entities to the existing list
            Set<String> uniqueSizes = new HashSet<>();
            for (SizeQuantityDTO sqDTO : productDTO.getSizeQuantities()) {
                if (sqDTO.getSize() != null && uniqueSizes.add(sqDTO.getSize())) {
                    SizeQuantity sizeQuantity = new SizeQuantity();
                    sizeQuantity.setProduct(updatedProduct);
                    sizeQuantity.setSize(sqDTO.getSize());
                    sizeQuantity.setQuantity(sqDTO.getQuantity());
                    updatedProduct.getSizeQuantities().add(sizeQuantity);
                }
            }
            // Persist the updated product with the modified sizeQuantities list
            productRepository.save(updatedProduct);
        }

        return convertToDTO(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(id);
    }

    @Transactional
    public List<Category> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        // Force initialization of allowedSubcategories to avoid LazyInitializationException
        categories.forEach(category -> {
            if (category.getAllowedSubcategories() == null) {
                category.setAllowedSubcategories(new ArrayList<>());
            }
            category.getAllowedSubcategories().size(); // Force initialization
        });
        return categories;
    }

    @Transactional
    public Category addCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsByCategoryName(categoryDTO.getCategoryName())) {
            throw new RuntimeException("Category already exists");
        }
        Category category = new Category();
        category.setCategoryName(categoryDTO.getCategoryName());
        category.setAllowedSubcategories(categoryDTO.getAllowedSubcategories());
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (!category.getCategoryName().equals(categoryDTO.getCategoryName()) && categoryRepository.existsByCategoryName(categoryDTO.getCategoryName())) {
            throw new RuntimeException("Category name already exists");
        }
        category.setCategoryName(categoryDTO.getCategoryName());
        List<String> existingSubcategories = category.getAllowedSubcategories() != null ? new ArrayList<>(category.getAllowedSubcategories()) : new ArrayList<>();
        List<String> newSubcategories = categoryDTO.getAllowedSubcategories() != null ? categoryDTO.getAllowedSubcategories() : new ArrayList<>();
        existingSubcategories.addAll(newSubcategories);
        category.setAllowedSubcategories(new ArrayList<>(new LinkedHashSet<>(existingSubcategories))); // Remove duplicates, preserve order
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found");
        }
        if (productRepository.findByCategoryId(id).size() > 0) {
            throw new RuntimeException("Cannot delete category with associated products");
        }
        categoryRepository.deleteById(id);
    }

    private int calculateTotalQuantity(ProductDTO productDTO) {
        if (productDTO.getHasSizes() && productDTO.getSizeQuantities() != null) {
            return productDTO.getSizeQuantities().stream()
                    .mapToInt(SizeQuantityDTO::getQuantity)
                    .sum();
        } else {
            return productDTO.getQuantity() != null ? productDTO.getQuantity() : 0;
        }
    }

    private void mapDTOToEntity(ProductDTO productDTO, Product product) {
        product.setName(productDTO.getProductName());
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        product.setCategory(category);
        product.setPurchasePrice(productDTO.getPurchasePrice());
        product.setSellingPrice(productDTO.getSellingPrice());
        product.setBrandName(productDTO.getBrandName());
        product.setPurchaseDate(LocalDate.parse(productDTO.getPurchaseDate()));

        // Merge incoming subcategories with existing ones, ensuring all allowed subcategories are present
        Map<String, String> incomingSubcategories = productDTO.getSubcategories() != null ? productDTO.getSubcategories() : new HashMap<>();
        List<String> allowedSubcategories = category.getAllowedSubcategories() != null ? category.getAllowedSubcategories() : new ArrayList<>();
        Map<String, String> updatedSubcategories = new HashMap<>(product.getSubcategories());

        // Ensure all allowed subcategories are in the map, using incoming values where available
        for (String subcat : allowedSubcategories) {
            if (incomingSubcategories.containsKey(subcat)) {
                updatedSubcategories.put(subcat, incomingSubcategories.get(subcat));
            } else if (!updatedSubcategories.containsKey(subcat)) {
                updatedSubcategories.put(subcat, "");
            }
        }
        product.setSubcategories(updatedSubcategories);

        product.setHasSizes(productDTO.getHasSizes());
        if (!productDTO.getHasSizes()) {
            product.setQuantity(productDTO.getQuantity());
        }
        // Image is handled in the controller, not here
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(product.getId());
        productDTO.setProductId(product.getProductId());
        productDTO.setProductName(product.getName());
        productDTO.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        productDTO.setPurchasePrice(product.getPurchasePrice());
        productDTO.setSellingPrice(product.getSellingPrice());
        productDTO.setBrandName(product.getBrandName());
        productDTO.setPurchaseDate(product.getPurchaseDate() != null ? product.getPurchaseDate().toString() : null);
        productDTO.setInStock(product.getInStock());
        productDTO.setSubcategories(product.getSubcategories());
        productDTO.setHasSizes(product.getHasSizes());
        if (product.getHasSizes() && product.getSizeQuantities() != null) {
            // Deduplicate sizeQuantities based on size
            Map<String, SizeQuantityDTO> uniqueSizeQuantities = new HashMap<>();
            for (SizeQuantity sq : product.getSizeQuantities()) {
                uniqueSizeQuantities.put(sq.getSize(), new SizeQuantityDTO(sq.getSize(), sq.getQuantity()));
            }
            productDTO.setSizeQuantities(new ArrayList<>(uniqueSizeQuantities.values()));
        } else {
            productDTO.setSizeQuantities(null);
            productDTO.setQuantity(product.getQuantity());
        }
        // Convert image to Base64 string for frontend
        if (product.getImage() != null) {
            productDTO.setImage(Base64.getEncoder().encodeToString(product.getImage()));
        }
        return productDTO;
    }
}